const state = {
  target: 'login',
  currentRun: null,
  timer: null,
};

const targetsEl = document.querySelector('#targets');
const presetsEl = document.querySelector('#presets');
const requestsEl = document.querySelector('#requests');
const vusEl = document.querySelector('#vus');
const maxVusEl = document.querySelector('#max-vus');
const durationEl = document.querySelector('#duration');
const httpTimeoutEl = document.querySelector('#http-timeout');
const tokenEl = document.querySelector('#token');
const usernamesEl = document.querySelector('#usernames');
const passwordEl = document.querySelector('#password');
const startEl = document.querySelector('#start');
const attackAllEl = document.querySelector('#attack-all');
const stopEl = document.querySelector('#stop');
const refreshEl = document.querySelector('#refresh');
const copyLogEl = document.querySelector('#copy-log');
const clearLogEl = document.querySelector('#clear-log');
const statusEl = document.querySelector('#status');
const runIdEl = document.querySelector('#run-id');
const logsEl = document.querySelector('#logs');
const metricElapsedEl = document.querySelector('#metric-elapsed');
const metricRequestsEl = document.querySelector('#metric-requests');
const metricProgressEl = document.querySelector('#metric-progress');
const metricRemainingEl = document.querySelector('#metric-remaining');
const metricRateEl = document.querySelector('#metric-rate');
const metricEffectiveDurationEl = document.querySelector('#metric-effective-duration');
const metricDroppedEl = document.querySelector('#metric-dropped');
const metricFailEl = document.querySelector('#metric-fail');
const metricP95El = document.querySelector('#metric-p95');
const metricAvgEl = document.querySelector('#metric-avg');
const metricStatusesEl = document.querySelector('#metric-statuses');
const metricReadingEl = document.querySelector('#metric-reading');

function fmt(value, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString('es-GT', { maximumFractionDigits: 2 })}${suffix}`;
}

function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '-';
  const total = Math.max(0, Math.floor(Number(seconds)));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${String(rest).padStart(2, '0')}s` : `${rest}s`;
}

function profileForRequests(requests) {
  if (requests <= 10) return { vus: 5, maxVus: 25, duration: '10s' };
  if (requests <= 1000) return { vus: 25, maxVus: 100, duration: '2m' };
  if (requests <= 10000) return { vus: 150, maxVus: 500, duration: '3m' };
  if (requests <= 50000) return { vus: 500, maxVus: 2000, duration: '5m' };
  return { vus: 1000, maxVus: 3000, duration: '5m' };
}

function applyProfile(requests) {
  const profile = profileForRequests(Number(requests || 10));
  vusEl.value = profile.vus;
  maxVusEl.value = profile.maxVus;
  durationEl.value = profile.duration;
}

function buildReading(run, summary) {
  if (!run) return 'Sin prueba activa.';
  const completed = summary?.completedIterations ?? run.completedIterations ?? 0;
  const requested = summary?.requestedIterations ?? run.requests ?? 0;
  const percent = requested > 0 ? Math.min(100, (completed / requested) * 100) : 0;
  if (run.status === 'running') {
    return `En curso: ${fmt(completed)} de ${fmt(requested)} completadas (${fmt(percent, '%')}). Faltan aprox. ${fmtDuration(run.remainingSeconds)} si la tasa se mantiene.`;
  }
  if (!summary) return `Estado: ${run.status}. Aun no hay resumen final.`;
  if ((summary.droppedIterations || 0) > 0) {
    return `No alcanzo la tasa: k6 dejo ${fmt(summary.droppedIterations)} sin lanzar. Faltan VUs o la API esta respondiendo lento.`;
  }
  if ((summary.status5xx || 0) > 0) {
    return `Hubo errores de servidor: ${fmt(summary.status5xx)} respuestas 5xx. Revisar microservicio, gateway o base de datos.`;
  }
  if ((summary.failRate || 0) > 0) {
    return `La prueba termino con errores: ${fmt(summary.failRate * 100, '%')} de fallos. Revisar codigos HTTP y logs.`;
  }
  return `Completada: ${fmt(completed)} de ${fmt(requested)} sin errores HTTP. Latencia p95 ${fmt(summary.p95, ' ms')}.`;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
  return payload;
}

function renderTargets(targets) {
  targetsEl.innerHTML = '';
  Object.entries(targets).forEach(([id, info]) => {
    const button = document.createElement('button');
    button.className = `target ${state.target === id ? 'active' : ''}`;
    button.textContent = info.label;
    button.onclick = () => {
      state.target = id;
      renderTargets(targets);
    };
    targetsEl.appendChild(button);
  });
}

function renderPresets(presets) {
  presetsEl.innerHTML = '';
  presets.forEach(value => {
    const button = document.createElement('button');
    button.className = `preset ${Number(requestsEl.value) === value ? 'active' : ''}`;
    button.textContent = value.toLocaleString('es-GT');
    button.onclick = () => {
      requestsEl.value = value;
      applyProfile(value);
      renderPresets(presets);
    };
    presetsEl.appendChild(button);
  });
  requestsEl.oninput = () => renderPresets(presets);
}

function renderRun(run) {
  state.currentRun = run;
  const running = run?.status === 'running';
  statusEl.textContent = run?.status || 'idle';
  metricElapsedEl.textContent = fmtDuration(run?.elapsedSeconds);
  runIdEl.textContent = run?.id ? run.id.slice(0, 8) : '-';
  stopEl.disabled = !running;
  startEl.disabled = running;
  attackAllEl.disabled = running;

  const summary = run?.summary;
  metricRequestsEl.textContent = fmt(summary?.requests);
  metricProgressEl.textContent = run
    ? `${fmt(summary?.completedIterations ?? run.completedIterations)} / ${fmt(summary?.requestedIterations ?? run.requests)}`
    : '-';
  metricRemainingEl.textContent = run?.status === 'running' ? fmtDuration(run.remainingSeconds) : '-';
  metricRateEl.textContent = (summary?.plannedRate ?? run?.plannedRate) !== undefined ? fmt(summary?.plannedRate ?? run?.plannedRate, '/s') : '-';
  metricEffectiveDurationEl.textContent = summary?.effectiveDuration || run?.effectiveDuration || '-';
  metricDroppedEl.textContent = fmt(summary?.droppedIterations);
  metricFailEl.textContent = fmt((summary?.failRate || 0) * 100, '%');
  metricP95El.textContent = fmt(summary?.p95, ' ms');
  metricAvgEl.textContent = fmt(summary?.avg, ' ms');
  metricStatusesEl.textContent = summary ? `${summary.status2xx || 0} / ${summary.status4xx || 0} / ${summary.status5xx || 0}` : '-';
  metricReadingEl.textContent = buildReading(run, summary);

  const logs = run?.logs || [];
  logsEl.textContent = logs.length
    ? logs.map(entry => `${(entry.at || '').slice(11, 19)} ${entry.line}`).join('\n')
    : 'Sin prueba activa.';
  logsEl.scrollTop = logsEl.scrollHeight;
}

async function refreshRun() {
  if (!state.currentRun?.id) {
    const current = await api('/api/runs/current');
    renderRun(current);
    return;
  }
  const run = await api(`/api/runs/${state.currentRun.id}`);
  renderRun(run);
}

function shouldConfirm(requests, target) {
  if (target === 'all') return requests >= 1000;
  return requests >= 10000;
}

async function start(target) {
  const requests = Number(requestsEl.value || 10);
  if (shouldConfirm(requests, target)) {
    const ok = window.confirm(`Vas a ejecutar ${requests.toLocaleString('es-GT')} peticiones contra ${target}. Confirmar.`);
    if (!ok) return;
  }

  const run = await api('/api/runs', {
    method: 'POST',
    body: JSON.stringify({
      target,
      requests,
      vus: Number(vusEl.value || 1),
      maxVus: Number(maxVusEl.value || 100),
      duration: durationEl.value || '15m',
      httpTimeout: httpTimeoutEl.value || '30s',
      token: tokenEl.value || '',
      usernames: usernamesEl.value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      password: passwordEl.value || '',
    }),
  });
  renderRun(run);
}

async function stop() {
  if (!state.currentRun?.id) return;
  const run = await api(`/api/runs/${state.currentRun.id}/stop`, { method: 'POST' });
  renderRun(run);
}

async function copyLog() {
  const text = logsEl.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
    copyLogEl.textContent = 'Copiado';
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    copyLogEl.textContent = 'Copiado';
  }
  setTimeout(() => {
    copyLogEl.textContent = 'Copiar log';
  }, 1200);
}

function clearLog() {
  logsEl.textContent = 'Log limpio. Ejecuta otra prueba.';
  metricElapsedEl.textContent = '-';
  metricRequestsEl.textContent = '-';
  metricProgressEl.textContent = '-';
  metricRemainingEl.textContent = '-';
  metricRateEl.textContent = '-';
  metricEffectiveDurationEl.textContent = '-';
  metricDroppedEl.textContent = '-';
  metricFailEl.textContent = '-';
  metricP95El.textContent = '-';
  metricAvgEl.textContent = '-';
  metricStatusesEl.textContent = '-';
  metricReadingEl.textContent = 'Log limpio. Ejecuta otra prueba.';
  statusEl.textContent = state.currentRun?.status === 'running' ? 'running' : 'idle';
  runIdEl.textContent = '-';
  if (state.currentRun?.status !== 'running') state.currentRun = null;
}

async function init() {
  const config = await api('/api/config');
  state.target = config.defaults.target;
  requestsEl.value = config.defaults.requests;
  vusEl.value = config.defaults.vus;
  maxVusEl.value = config.defaults.maxVus;
  durationEl.value = config.defaults.duration;
  httpTimeoutEl.value = config.defaults.httpTimeout;
  renderTargets(config.targets);
  renderPresets(config.presets);
  renderRun(await api('/api/runs/current'));

  startEl.onclick = () => start(state.target).catch(error => alert(error.message));
  attackAllEl.onclick = () => start('all').catch(error => alert(error.message));
  stopEl.onclick = () => stop().catch(error => alert(error.message));
  refreshEl.onclick = () => refreshRun().catch(error => alert(error.message));
  copyLogEl.onclick = () => copyLog().catch(error => alert(error.message));
  clearLogEl.onclick = clearLog;
  state.timer = setInterval(() => refreshRun().catch(() => {}), 1500);
}

init().catch(error => {
  logsEl.textContent = error.message;
});
