const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3005;

app.use(express.json());

// --- MIDDLEWARE ANTI-DUPLICACIÓN DE CORS ---
// Este middleware se asegura de que NO se envíen headers duplicados que bloqueen el navegador
app.use((req, res, next) => {
  res.on('header', () => {
    // Si por alguna razón hay múltiples Access-Control-Allow-Origin, los limpiamos
    const origin = res.getHeader('Access-Control-Allow-Origin');
    if (Array.isArray(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin[0]);
    }
  });
  next();
});

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
  baseURL: 'http://localhost', // Usamos localhost para el socket
  timeout: 5000
});

app.get('/api/swarm/state', async (req, res) => {
  try {
    // Intentamos la versión más compatible de la API de Docker
    const [nodesRes, tasksRes] = await Promise.all([
      docker.get('/nodes'),
      docker.get('/tasks?filters={"desired-state":["running"]}')
    ]);

    const state = nodesRes.data.map(node => ({
      id: node.ID,
      hostname: node.Description.Hostname,
      status: (node.Status.State || 'unknown').toLowerCase(),
      availability: (node.Spec.Availability || 'active').toLowerCase(),
      role: (node.Spec.Role || 'worker').toLowerCase(),
      tasks: (tasksRes.data || [])
        .filter(task => task.NodeID === node.ID)
        .map(task => {
          const fullImage = task.Spec.ContainerSpec.Image;
          const nameWithTag = fullImage.includes('/') ? fullImage.split('/')[1] : fullImage;
          return {
            id: task.ID,
            name: nameWithTag.split(':')[0] || 'task',
            status: 'running'
          };
        })
    }));
    res.json(state);
  } catch (err) {
    console.error('SWARM ERROR:', err.message);
    // Retornamos 200 con el error en el cuerpo para evitar que el Gateway 
    // genere páginas de error 500 que duplican los headers de CORS
    res.json({ error: true, message: err.message });
  }
});

app.get('/api/patroni/state', async (req, res) => {
  const hosts = ['34.45.194.127', '34.29.234.240'];
  for (const host of hosts) {
    try {
      const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 2000 });
      return res.json(response.data);
    } catch (e) { continue; }
  }
  res.json({ error: true, message: 'Patroni unreachable' });
});

// Endpoints de acción sencillos
app.post('/api/swarm/node/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const { data: node } = await docker.get(`/nodes/${id}`);
    await docker.post(`/nodes/${id}/update?version=${node.Version.Index}`, {
      ...node.Spec,
      Availability: action === 'drain' ? 'drain' : 'active'
    });
    res.json({ message: 'OK' });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

app.listen(PORT, () => console.log(`Chaos Proxy (Clean-Mode) running on ${PORT}`));
