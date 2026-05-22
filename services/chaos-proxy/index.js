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
          const fullImage = task.Spec.ContainerSpec.Image;
          const nameWithTag = fullImage.includes('/') ? fullImage.split('/')[1] : fullImage;
          return {
            id: task.ID,
            name: nameWithTag.split(':')[0].toUpperCase(),
            status: 'running'
          };
        })
    }));

    // FORZAR REDIS Y RABBIT (NODO 1)
    const manager = state.find(n => n.role === 'manager' || n.hostname.toLowerCase() === 'vps');
    if (manager) {
      manager.tasks.push(
        { id: 'sys-redis', name: 'REDIS-SERVER', status: 'running', type: 'system' },
        { id: 'sys-rabbit', name: 'RABBITMQ-BROKER', status: 'running', type: 'system' }
      );
    }
    res.json(state);
  } catch (err) {
    res.json({ error: true, msg: 'DOCKER_FAIL: ' + err.message });
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
          const rStr = (m.role || '').toLowerCase();
          return { ...m, is_leader: rStr.includes('leader') || rStr.includes('primary') || rStr.includes('master') };
        });
      }
      return res.json(data);
    } catch (e) { continue; }
  }
  res.json({ error: true, msg: 'DATABASE_UNREACHABLE' });
});

app.listen(PORT, () => console.log('Chaos Proxy v10.1 READY'));
