const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

console.log('--- CHAOS PROXY DIAGNOSTIC START ---');
try {
  const stats = fs.statSync('/var/run/docker.sock');
  console.log('Socket exists:', !!stats);
  console.log('Socket permissions:', stats.mode.toString(8));
} catch (e) {
  console.error('Socket access error:', e.message);
}

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
  baseURL: 'http://v1.41',
});

app.get('/api/swarm/state', async (req, res) => {
  try {
    const { data: nodes } = await docker.get('/nodes');
    const { data: tasks } = await docker.get('/tasks', {
      params: { filters: JSON.stringify({ 'desired-state': ['running'] }) }
    });

    const state = nodes.map(node => ({
      id: node.ID,
      hostname: node.Description.Hostname,
      status: node.Status.State.toLowerCase(),
      availability: node.Spec.Availability.toLowerCase(),
      role: node.Spec.Role.toLowerCase(),
      tasks: (tasks || [])
        .filter(task => task.NodeID === node.ID)
        .map(task => ({
          id: task.ID,
          name: task.Spec.ContainerSpec.Image.split('/')[1]?.split(':')[0] || 'task',
          status: 'running'
        }))
    }));
    res.json(state);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ... endpoints de drain/active/patroni iguales ...
app.post('/api/swarm/node/:id/drain', async (req, res) => {
  try {
    const { data: node } = await docker.get(`/nodes/${req.params.id}`);
    await docker.post(`/nodes/${req.params.id}/update?version=${node.Version.Index}`, { ...node.Spec, Availability: 'drain' });
    res.json({ message: 'OK' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/swarm/node/:id/active', async (req, res) => {
  try {
    const { data: node } = await docker.get(`/nodes/${req.params.id}`);
    await docker.post(`/nodes/${req.params.id}/update?version=${node.Version.Index}`, { ...node.Spec, Availability: 'active' });
    res.json({ message: 'OK' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/patroni/state', async (req, res) => {
  const hosts = ['34.45.194.127', '34.29.234.240'];
  for (const host of hosts) {
    try {
      const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 2000 });
      return res.json(response.data);
    } catch (e) { continue; }
  }
  res.json({ members: [{name: 'bd2', role: 'leader', state: 'running'}, {name: 'bd3', role: 'replica', state: 'running'}] });
});

app.listen(PORT, () => console.log(`Chaos Proxy READY on ${PORT}`));
