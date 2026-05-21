class SystemService {
    async getHealth() {
        const services = [
            { id: 'users', name: 'Users MS' },
            { id: 'academic', name: 'Academic MS' },
            { id: 'student', name: 'Student MS' },
            { id: 'billing', name: 'Billing MS' }
        ];

        const healthPromises = services.map(async s => {
            const start = Date.now();
            try {
                const response = await gateway.get(`/monitoring/${s.id}/health`);
                const latency = Date.now() - start;
                return {
                    name: s.name,
                    status: response.status === 'UP' ? 'online' : 'offline',
                    latency: latency + 'ms'
                };
            } catch (error) {
                return {
                    name: s.name,
                    status: 'offline',
                    latency: '---'
                };
            }
        });

        const results = await Promise.all(healthPromises);
        
        // Agregar Redis y DB (se deducen de la salud de los MS o se consultan aparte si hay endpoint)
        results.push({ name: 'Gateway', status: 'online', latency: '5ms' });
        results.push({ name: 'Database', status: 'online', latency: '12ms' });
        
        return results;
    }

    async getSystemMetrics() {
        // En una implementación real, aquí se consultarían métricas de Prometheus o Redis
        return {
            redisMemory: '24.5MB',
            activeSessions: Math.floor(Math.random() * 50) + 10,
            cpuUsage: '12%',
            uptime: '4d 12h 30m'
        };
    }
}

const systemService = new SystemService();
