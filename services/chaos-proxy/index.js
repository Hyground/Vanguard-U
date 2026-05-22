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

app.get('/api/swarm/state', async (req, res) => {
  try {
    const [nRes, tRes] = await Promise.all([docker.get('/nodes'), docker.get('/tasks?filters={"desired-state":["running"]}')]);
    const state = nRes.data.map(n => ({
      id: n.ID,
      hostname: n.Description.Hostname,
      status: (n.Status.State || 'active').toLowerCase(),
      availability: (n.Spec.Availability || 'active').toLowerCase(),
      role: (n.Spec.Role || 'worker').toLowerCase(),
      tasks: (tRes.data || []).filter(t => t.NodeID === n.ID).map(t => {
        const img = t.Spec.ContainerSpec.Image;
        const name = (img.includes('/') ? img.split('/')[1] : img).split(':')[0];
        return { id: t.ID, name: name.toUpperCase(), status: 'running' };
      })
    }));

    // FORZAR REDIS Y RABBIT EN NODO 1
    const m = state.find(n => n.role === 'manager' || n.hostname.includes('vps'));
    if (m) {
      m.tasks.push(
        { id: 'sys-1', name: 'REDIS-SERVER', status: 'running', type: 'system' },
        { id: 'sys-2', name: 'RABBITMQ-BROKER', status: 'running', type: 'system' }
      );
    }
    res.json(state);
  } catch (err) { res.json({ error: true, msg: err.message }); }
});

app.get('/api/patroni/state', async (req, res) => {
  const hosts = ['34.45.194.127', '34.29.234.240', '34.68.197.98'];
  for (const h of hosts) {
    try {
      const r = await axios.get(`http://${h}:8008/cluster`, { timeout: 2000 });
      const d = r.data;
      if (d.members) {
        d.members = d.members.map(m => {
          const role = (m.role || '').toLowerCase();
          return { ...m, is_leader: role === 'leader' || role === 'primary' || role === 'master' };
        });
      }
      return res.json(d);
    } catch (e) { continue; }
  }
  res.json({ error: true, msg: 'Offline' });
});

app.listen(PORT, () => console.log('Chaos Proxy V4 READY'));
