const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3005;

app.use(express.json());

// --- ESCUDO ANTI-CORS DUPLICADO ---
app.use((req, res, next) => {
  res.on('header', () => {
    const origin = res.getHeader('Access-Control-Allow-Origin');
    if (Array.isArray(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin[0]);
    }
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
          // FORZAMOS MAYÚSCULAS PARA IDENTIFICACIÓN CLARA
          return {
            id: task.ID,
            name: nameWithTag.split(':')[0].toUpperCase() || 'TASK',
            status: 'running'
          };
        })
    }));

    // INYECTAR SERVICIOS CENTRALES (Redis/Rabbit viven en el Nodo 1)
    // Usamos el hostname 'vps' o el rol 'manager'
    const manager = state.find(n => n.role === 'manager' || n.hostname.toLowerCase() === 'vps');
    if (manager) {
      // Evitar duplicados si el proxy se reinicia
      if (!manager.tasks.some(t => t.id === 'sys-redis')) {
        manager.tasks.push(
          { id: 'sys-redis', name: 'REDIS-SERVER', status: 'running', type: 'system' },
          { id: 'sys-rabbit', name: 'RABBITMQ-BROKER', status: 'running', type: 'system' }
        );
      }
    }

    res.json(state);
  } catch (err) {
    res.json({ error: true, msg: 'ERROR_DOCKER_SOCKET: ' + err.message });
  }
});

app.get('/api/patroni/state', async (req, res) => {
  // IPs reales de tus nodos Patroni
  const hosts = ['34.45.194.127', '34.29.234.240', '34.68.197.98'];
  for (const host of hosts) {
    try {
      const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 3000 });
      const data = response.data;
      
      if (data.members) {
        data.members = data.members.map(m => {
          const rStr = (m.role || '').toLowerCase();
          // Detección de líder ultra-robusta
          const isLeader = rStr.includes('leader') || rStr.includes('primary') || rStr.includes('master');
          return { ...m, is_leader: isLeader };
        });
      }
      return res.json(data);
    } catch (e) { continue; }
  }
  res.json({ error: true, msg: 'DATABASE_CLUSTER_UNREACHABLE' });
});

app.post('/api/swarm/node/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const { data: node } = await docker.get(`/nodes/${id}`);
    await docker.post(`/nodes/${id}/update?version=${node.Version.Index}`, {
      ...node.Spec,
      Availability: action === 'drain' ? 'drain' : 'active'
    });
    res.json({ message: 'OK' });
  } catch (err) { res.json({ error: true, message: err.message }); }
});

app.listen(PORT, () => console.log(`Chaos Proxy vFINAL READY on ${PORT}`));
