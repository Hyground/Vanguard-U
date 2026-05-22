const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = Number(process.env.PORT || 3006);
const RUNS_DIR = path.join(__dirname, 'runs');

fs.mkdirSync(RUNS_DIR, { recursive: true });

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const runs = new Map();

const targets = {
  login: { label: 'Login' },
  users: { label: 'Usuarios' },
  students: { label: 'Estudiantes' },
  enrollments: { label: 'Inscripciones' },
  payments: { label: 'Pagos' },
  all: { label: 'Todo' },
};

const presets = [10, 1000, 10000, 50000, 100000];

function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function cleanDuration(value) {
  const text = String(value || '5m').trim();
  return /^[0-9]+(s|m|h)$/.test(text) ? text : '5m';
}

function serializeRun(run) {
  return {
    id: run.id,
    status: run.status,
    target: run.target,
    requests: run.requests,
    vus: run.vus,
    duration: run.duration,
    baseUrl: run.baseUrl,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    exitCode: run.exitCode,
    summary: run.summary,
    logs: run.logs.slice(-120),
  };
}

function appendLog(run, chunk) {
  const text = String(chunk || '').trim();
  if (!text) return;
  for (const line of text.split(/\r?\n/).filter(Boolean)) {
    run.logs.push({ at: new Date().toISOString(), line });
  }
  if (run.logs.length > 600) run.logs.splice(0, run.logs.length - 600);
  fs.writeFileSync(path.join(RUNS_DIR, `${run.id}.json`), JSON.stringify(serializeRun(run), null, 2));
}

function parseSummary(run, chunk) {
  const lines = String(chunk || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (!line.startsWith('{') || !line.endsWith('}')) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'k6-summary') run.summary = parsed;
    } catch (error) {
      // k6 output can contain non-summary text.
    }
  }
}

function k6Script() {
  return String.raw`
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://api.wissegt.com';
const USERNAME = __ENV.USERNAME || 'load_admin';
const PASSWORD = __ENV.PASSWORD || 'Demo123!';
const TARGET = (__ENV.TARGET || 'login').toLowerCase();
const REQUESTS = Number(__ENV.REQUESTS || 10);
const VUS = Number(__ENV.VUS || 1);
const DURATION = __ENV.DURATION || '5m';
const PAGE_SIZE = Number(__ENV.PAGE_SIZE || 20);

const endpointDuration = new Trend('vanguard_endpoint_duration');
const authFailures = new Rate('vanguard_auth_failures');
const status2xx = new Counter('vanguard_status_2xx');
const status3xx = new Counter('vanguard_status_3xx');
const status4xx = new Counter('vanguard_status_4xx');
const status5xx = new Counter('vanguard_status_5xx');

export const options = {
  scenarios: {
    selected: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: REQUESTS,
      maxDuration: DURATION
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.50'],
    http_req_duration: ['p(95)<10000']
  },
  tags: {
    app: 'vanguard-u',
    target: TARGET
  }
};

function parseJson(res) {
  try {
    return res.json();
  } catch (error) {
    return null;
  }
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  };
}

function recordStatus(res) {
  if (res.status >= 200 && res.status < 300) status2xx.add(1);
  if (res.status >= 300 && res.status < 400) status3xx.add(1);
  if (res.status >= 400 && res.status < 500) status4xx.add(1);
  if (res.status >= 500) status5xx.add(1);
}

function loginRequest() {
  const res = http.post(BASE_URL + '/api/v1/auth/login', JSON.stringify({ username: USERNAME, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login' },
    timeout: '15s'
  });
  recordStatus(res);
  return res;
}

export function setup() {
  if (TARGET === 'login') {
    console.log('setup skipped: login target does not need bearer token');
    return { token: null };
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    console.log('setup login attempt ' + attempt + '/3');
    const res = loginRequest();
    const body = parseJson(res);
    const ok = check(res, {
      'setup login 200': (r) => r.status === 200,
      'setup token present': () => Boolean(body && body.token)
    });
    authFailures.add(!ok);
    if (ok) return { token: body.token };
    console.log('setup login failed status=' + res.status);
    sleep(1);
  }

  throw new Error('Setup login failed after 3 attempts; target ' + TARGET + ' was not executed');
}

function get(path, token, endpoint) {
  const res = http.get(BASE_URL + path, {
    ...authHeaders(token),
    tags: { endpoint }
  });
  recordStatus(res);
  endpointDuration.add(res.timings.duration, { endpoint });
  check(res, {
    [endpoint + ' not 5xx']: (r) => r.status < 500,
    [endpoint + ' authorized']: (r) => r.status !== 401 && r.status !== 403
  });
  return res;
}

function attackLogin() {
  const res = loginRequest();
  check(res, { 'login attack 200': (r) => r.status === 200 });
}

function attackUsers(token) {
  get('/api/v1/admin/security/identity?section=users&userPage=0&peoplePage=0&size=' + PAGE_SIZE, token, 'identity-users');
}

function attackStudents(token) {
  get('/api/v1/admin/security/identity?section=students&userPage=0&peoplePage=0&size=' + PAGE_SIZE, token, 'identity-students');
  get('/api/v1/students?page=0&size=' + PAGE_SIZE + '&sort=id,desc', token, 'students');
}

function attackEnrollments(token) {
  get('/api/v1/enrollments?page=0&size=' + PAGE_SIZE + '&sort=id,desc', token, 'enrollments');
}

function attackPayments(token) {
  get('/api/v1/billing/payment-methods', token, 'billing-payment-methods');
  get('/api/v1/billing/payments/student/1', token, 'billing-payments-student');
}

export default function (data) {
  group('attack-' + TARGET, () => {
    if (TARGET === 'login') attackLogin();
    if (TARGET === 'users') attackUsers(data.token);
    if (TARGET === 'students') attackStudents(data.token);
    if (TARGET === 'enrollments') attackEnrollments(data.token);
    if (TARGET === 'payments') attackPayments(data.token);
    if (TARGET === 'all') {
      attackLogin();
      attackUsers(data.token);
      attackStudents(data.token);
      attackEnrollments(data.token);
      attackPayments(data.token);
      get('/api/v1/admin/summary', data.token, 'admin-summary');
    }
  });
  sleep(Number(__ENV.SLEEP_SECONDS || 0));
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration?.values || {};
  const failed = data.metrics.http_req_failed?.values || {};
  const requests = data.metrics.http_reqs?.values || {};
  return {
    stdout: JSON.stringify({
      type: 'k6-summary',
      target: TARGET,
      requests: requests.count || 0,
      failRate: failed.rate || 0,
      p95: duration['p(95)'] || 0,
      avg: duration.avg || 0,
      status2xx: data.metrics.vanguard_status_2xx?.values?.count || 0,
      status3xx: data.metrics.vanguard_status_3xx?.values?.count || 0,
      status4xx: data.metrics.vanguard_status_4xx?.values?.count || 0,
      status5xx: data.metrics.vanguard_status_5xx?.values?.count || 0
    }) + '\n'
  };
}
`;
}

function startRun(input) {
  const active = Array.from(runs.values()).find(run => run.status === 'running');
  if (active) {
    const err = new Error('Ya hay una prueba corriendo');
    err.status = 409;
    err.run = serializeRun(active);
    throw err;
  }

  const target = targets[input.target] ? input.target : 'login';
  const requests = clampNumber(input.requests, 10, 1, 100000);
  const vus = clampNumber(input.vus, 1, 1, 2000);
  const duration = cleanDuration(input.duration);
  const id = randomUUID();

  const run = {
    id,
    status: 'running',
    target,
    requests,
    vus,
    duration,
    baseUrl: process.env.BASE_URL || input.baseUrl || 'https://api.wissegt.com',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
    summary: null,
    logs: [],
    child: null,
  };
  runs.set(id, run);
  appendLog(run, `start target=${target} requests=${requests} vus=${vus} duration=${duration}`);

  const env = {
    BASE_URL: run.baseUrl,
    USERNAME: process.env.LOAD_USERNAME || input.username || 'load_admin',
    PASSWORD: process.env.LOAD_PASSWORD || input.password || 'Demo123!',
    TARGET: target,
    REQUESTS: String(requests),
    VUS: String(vus),
    DURATION: duration,
    PAGE_SIZE: String(clampNumber(input.pageSize, 20, 1, 100)),
  };

  const args = [
    'run',
    '--rm',
    '-i',
    '--network',
    'host',
    ...Object.entries(env).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
    'grafana/k6',
    'run',
    '-',
  ];

  const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
  run.child = child;

  child.stdin.write(k6Script());
  child.stdin.end();

  child.stdout.on('data', chunk => {
    parseSummary(run, chunk);
    appendLog(run, chunk);
  });
  child.stderr.on('data', chunk => appendLog(run, chunk));
  child.on('error', error => {
    run.status = 'failed';
    run.finishedAt = new Date().toISOString();
    appendLog(run, error.message);
  });
  child.on('close', code => {
    run.exitCode = code;
    run.status = code === 0 ? 'completed' : 'failed';
    run.finishedAt = new Date().toISOString();
    appendLog(run, `finished exitCode=${code}`);
  });

  return run;
}

app.get('/api/config', (req, res) => {
  res.json({
    targets,
    presets,
    defaults: {
      target: 'login',
      requests: 10,
      vus: 1,
      duration: '2m',
      baseUrl: process.env.BASE_URL || 'https://api.wissegt.com',
    },
  });
});

app.get('/api/runs', (req, res) => {
  res.json(Array.from(runs.values()).map(serializeRun).reverse());
});

app.get('/api/runs/current', (req, res) => {
  const active = Array.from(runs.values()).find(run => run.status === 'running');
  res.json(active ? serializeRun(active) : null);
});

app.get('/api/runs/:id', (req, res) => {
  const run = runs.get(req.params.id);
  if (!run) return res.status(404).json({ message: 'Run no encontrado' });
  res.json(serializeRun(run));
});

app.post('/api/runs', (req, res) => {
  try {
    const run = startRun(req.body || {});
    res.status(202).json(serializeRun(run));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message, run: error.run });
  }
});

app.post('/api/runs/:id/stop', (req, res) => {
  const run = runs.get(req.params.id);
  if (!run) return res.status(404).json({ message: 'Run no encontrado' });
  if (run.status !== 'running') return res.json(serializeRun(run));
  run.status = 'stopping';
  appendLog(run, 'stop requested');
  run.child?.kill('SIGTERM');
  res.json(serializeRun(run));
});

app.listen(PORT, () => {
  console.log(`k6 lab listening on ${PORT}`);
});
