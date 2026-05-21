const express = require('express');
const Docker = require('dockerode');
const axios = require('axios');
const cors = require('cors');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const PORT = 3005;

app.use(cors());
app.use(express.json());

// --- SWARM ENDPOINTS ---

app.get('/api/swarm/state', async (req, res) => {
  try {
    const nodes = await docker.listNodes();
    const tasks = await docker.listTasks({
      filters: { desired-state: ['running'] }
    });

    const state = nodes.map(node => ({
      id: node.ID,
      hostname: node.Description.Hostname,
      status: node.Status.State,
      availability: node.Spec.Availability,
      role: node.Spec.Role,
      tasks: tasks
        .filter(task => task.NodeID === node.ID)
        .map(task => ({
          id: task.ID,
          name: task.Spec.ContainerSpec.Image.split('/')[1]?.split(':')[0] || 'task',
          status: task.Status.State
        }))
    }));

    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/swarm/node/:id/drain', async (req, res) => {
  try {
    const node = docker.getNode(req.params.id);
    const nodeInfo = await node.inspect();
    await node.update({
      ...nodeInfo.Spec,
      Availability: 'drain'
    });
    res.json({ message: 'Node set to DRAIN' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/swarm/node/:id/active', async (req, res) => {
  try {
    const node = docker.getNode(req.params.id);
    const nodeInfo = await node.inspect();
    await node.update({
      ...nodeInfo.Spec,
      Availability: 'active'
    });
    res.json({ message: 'Node set to ACTIVE' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/swarm/rebalance', async (req, res) => {
  try {
    const services = await docker.listServices();
    for (const serviceInfo of services) {
      const service = docker.getService(serviceInfo.ID);
      const spec = serviceInfo.Spec;
      // Triggers a rolling update to redistribute tasks
      spec.TaskTemplate.ForceUpdate = (spec.TaskTemplate.ForceUpdate || 0) + 1;
      await service.update(serviceInfo.Version.Index, spec);
    }
    res.json({ message: 'Rebalance initiated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PATRONI ENDPOINTS ---

const PATRONI_HOSTS = ['34.45.194.127', '34.29.234.240'];

app.get('/api/patroni/state', async (req, res) => {
  try {
    // Try to get state from the first available node
    for (const host of PATRONI_HOSTS) {
      try {
        const response = await axios.get(`http://${host}:8008/cluster`, { timeout: 2000 });
        return res.json(response.data);
      } catch (e) {
        continue;
      }
    }
    throw new Error('Could not connect to Patroni API');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patroni/failover', async (req, res) => {
  try {
    // Send failover command to Patroni
    // Note: In production this requires auth if configured
    const response = await axios.post(`http://${PATRONI_HOSTS[0]}:8008/failover`, {
      leader: 'bd2', // or dynamically detected
      candidate: 'bd3'
    }, { timeout: 5000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chaos Proxy running on port ${PORT}`);
});
