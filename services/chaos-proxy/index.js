const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3005;

app.use(express.json());

// --- ESCUDO ANTI-CORS ---
app.use((req, res, next) => {
  res.on('header', () => {
    const origin = res.getHeader('Access-Control-Allow-Origin');
    if (Array.isArray(origin)) res.setHeader('Access-Control-Allow-Origin', origin[0]);
  });
  next();
});

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
  baseURL: 'http://localhost',
  timeout: 5000
});

function normalizeServiceName(name) {
  return String(name || '')
    .replace(/^vanguard_/, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

function getPatroniHosts() {
  return (process.env.PATRONI_API_HOSTS || '34.45.194.127,34.29.234.240,34.68.197.98')
    .split(',')
    .map(host => host.trim())
    .filter(Boolean);
}

async function fetchPatroniCluster() {
  const errors = [];

  for (const host of getPatroniHosts()) {
    try {
      const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 4000 });
      const data = response.data;
      if (data.members) {
        data.members = data.members.map(m => {
          const rStr = (m.role || '').toLowerCase();
          return { ...m, is_leader: rStr.includes('leader') || rStr.includes('primary') || rStr.includes('master') };
        });
      }
      return { data: { ...data, source: host }, errors };
    } catch (e) {
      errors.push({ host, message: e.message });
    }
  }

  return { data: null, errors };
}

app.get('/api/swarm/state', async (req, res) => {
  try {
    const [nRes, tRes, sRes] = await Promise.all([
      docker.get('/nodes'),
      docker.get('/tasks?filters={"desired-state":["running"]}'),
      docker.get('/services')
    ]);

    const servicesById = new Map((sRes.data || []).map(service => [
      service.ID,
      normalizeServiceName(service.Spec?.Name)
    ]));

    const state = nRes.data.map(n => ({
      id: n.ID,
      hostname: n.Description.Hostname,
      status: (n.Status.State || 'active').toLowerCase(),
      availability: (n.Spec.Availability || 'active').toLowerCase(),
      role: (n.Spec.Role || 'worker').toLowerCase(),
      tasks: (tRes.data || [])
        .filter(task => task.NodeID === n.ID && (task.Status?.State || '').toLowerCase() === 'running')
        .map(task => {
          const serviceName = servicesById.get(task.ServiceID);
          const fullImage = task.Spec?.ContainerSpec?.Image || '';
          const imageName = fullImage.includes('/') ? fullImage.split('/').pop() : fullImage;
          return {
            id: task.ID,
            name: serviceName || imageName.split(':')[0].toUpperCase(),
            status: (task.Status?.State || 'running').toLowerCase(),
            desiredState: (task.DesiredState || '').toLowerCase()
          };
        })
    }));

    res.json(state);
  } catch (err) {
    res.status(503).json({ error: true, msg: 'DOCKER_FAIL: ' + err.message });
  }
});

app.post('/api/swarm/node/:id/:action', async (req, res) => {
  const availabilityByAction = {
    active: 'active',
    drain: 'drain',
    pause: 'pause'
  };
  const availability = availabilityByAction[req.params.action];

  if (!availability) {
    return res.status(400).json({ error: true, msg: 'Accion no soportada' });
  }

  try {
    const node = await docker.get(`/nodes/${req.params.id}`);
    const spec = {
      ...node.data.Spec,
      Availability: availability
    };

    await docker.post(`/nodes/${req.params.id}/update?version=${node.data.Version.Index}`, spec);
    res.json({ ok: true, nodeId: req.params.id, availability });
  } catch (err) {
    res.status(503).json({ error: true, msg: 'NODE_UPDATE_FAIL: ' + err.message });
  }
});

app.get('/api/patroni/state', async (req, res) => {
  const { data, errors } = await fetchPatroniCluster();
  if (data) {
    return res.json(data);
  }
  res.status(503).json({ error: true, msg: 'DATABASE_UNREACHABLE', errors });
});

app.post('/api/patroni/failover', async (req, res) => {
  const { data, errors } = await fetchPatroniCluster();
  if (!data?.members?.length) {
    return res.status(503).json({ error: true, msg: 'DATABASE_UNREACHABLE', errors });
  }

  const leader = data.members.find(member => member.is_leader);
  const candidate = data.members.find(member => !member.is_leader && ['running', 'streaming'].includes((member.state || '').toLowerCase()));

  if (!leader || !candidate) {
    return res.status(409).json({ error: true, msg: 'No hay lider y replica saludable para failover', members: data.members });
  }

  const leaderApi = leader.api_url || `http://${data.source}:8008`;

  try {
    const response = await axios.post(`${leaderApi}/switchover`, {
      leader: leader.name,
      candidate: candidate.name
    }, { timeout: 5000 });

    res.json({ ok: true, leader: leader.name, candidate: candidate.name, status: response.status });
  } catch (err) {
    res.status(503).json({ error: true, msg: 'PATRONI_FAILOVER_FAIL: ' + err.message });
  }
});

app.listen(PORT, () => console.log('Chaos Proxy v10.1 READY'));
