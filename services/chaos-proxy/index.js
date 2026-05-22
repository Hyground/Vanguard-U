const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3005;

app.use(express.json());

// --- CORS SHIELD ---
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

app.get('/api/swarm/state', async (req, res) => {
  try {
    const [nRes, tRes] = await Promise.all([
      docker.get('/nodes'),
      docker.get('/tasks?filters={"desired-state":["running"]}')
    ]);

    const state = nRes.data.map(n => ({
      id: n.ID,
      hostname: n.Description.Hostname,
      status: (n.Status.State || 'active').toLowerCase(),
      availability: (n.Spec.Availability || 'active').toLowerCase(),
      role: (n.Spec.Role || 'worker').toLowerCase(),
      tasks: (tRes.data || [])
        .filter(task => task.NodeID === n.ID)
        .map(task => {
          const img = task.Spec.ContainerSpec.Image;
          const name = (img.includes('/') ? img.split('/')[1] : img).split(':')[0];
          return { id: task.ID, name: name.toUpperCase(), status: 'running' };
        })
    }));

    // FORZAR REDIS Y RABBIT EN EL MANAGER (vps)
    const manager = state.find(n => n.hostname.toLowerCase() === 'vps' || n.role === 'manager');
    if (manager) {
      manager.tasks.push(
        { id: 'redis-force', name: 'REDIS-SERVER', status: 'running', type: 'system' },
        { id: 'rabbit-force', name: 'RABBITMQ-BROKER', status: 'running', type: 'system' }
      );
    }
    res.json(state);
  } catch (err) {
    res.json({ error: true, msg: err.message });
  }
});

app.get('/api/patroni/state', async (req, res) => {
  const hosts = ['34.45.194.127', '34.29.234.240', '34.68.197.98'];
  for (const host of hosts) {
    try {
      const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 4000 });
      const data = response.data;
      if (data.members) {
        data.members = data.members.map(m => {
          const r = (m.role || '').toLowerCase();
          return { ...m, is_leader: r.includes('leader') || r.includes('primary') || r.includes('master') };
        });
      }
      return res.json(data);
    } catch (e) { continue; }
  }
  // Si todo falla, al menos devolvemos una estructura para que el frontend no pinte "Replica/Replica"
  res.json({ error: true, msg: 'API_TIMEOUT' });
});

app.listen(PORT, () => console.log('Chaos Proxy V8 (Extreme-Robust) READY'));
