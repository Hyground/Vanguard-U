const state = {
  target: 'login',
  currentRun: null,
  timer: null,
};

const targetsEl = document.querySelector('#targets');
const presetsEl = document.querySelector('#presets');
const requestsEl = document.querySelector('#requests');
const vusEl = document.querySelector('#vus');
const durationEl = document.querySelector('#duration');
const startEl = document.querySelector('#start');
const attackAllEl = document.querySelector('#attack-all');
const stopEl = document.querySelector('#stop');
const refreshEl = document.querySelector('#refresh');
const copyLogEl = document.querySelector('#copy-log');
const clearLogEl = document.querySelector('#clear-log');
const statusEl = document.querySelector('#status');
const runIdEl = document.querySelector('#run-id');
const logsEl = document.querySelector('#logs');
const metricRequestsEl = document.querySelector('#metric-requests');
const metricFailEl = document.querySelector('#metric-fail');
const metricP95El = document.querySelector('#metric-p95');
const metricAvgEl = document.querySelector('#metric-avg');
const metricStatusesEl = document.querySelector('#metric-statuses');

function fmt(value, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString('es-GT', { maximumFractionDigits: 2 })}${suffix}`;
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
  runIdEl.textContent = run?.id ? run.id.slice(0, 8) : '-';
  stopEl.disabled = !running;
  startEl.disabled = running;
  attackAllEl.disabled = running;

  const summary = run?.summary;
  metricRequestsEl.textContent = fmt(summary?.requests);
  metricFailEl.textContent = fmt((summary?.failRate || 0) * 100, '%');
  metricP95El.textContent = fmt(summary?.p95, ' ms');
  metricAvgEl.textContent = fmt(summary?.avg, ' ms');
  metricStatusesEl.textContent = summary ? `${summary.status2xx || 0} / ${summary.status4xx || 0} / ${summary.status5xx || 0}` : '-';

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
      duration: durationEl.value || '2m',
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
  metricRequestsEl.textContent = '-';
  metricFailEl.textContent = '-';
  metricP95El.textContent = '-';
  metricAvgEl.textContent = '-';
  metricStatusesEl.textContent = '-';
  statusEl.textContent = state.currentRun?.status === 'running' ? 'running' : 'idle';
  runIdEl.textContent = '-';
  if (state.currentRun?.status !== 'running') state.currentRun = null;
}

async function init() {
  const config = await api('/api/config');
  state.target = config.defaults.target;
  requestsEl.value = config.defaults.requests;
  vusEl.value = config.defaults.vus;
  durationEl.value = config.defaults.duration;
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
