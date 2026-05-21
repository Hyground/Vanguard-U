class SystemService {
    async getHealth() {
        try {
            // En producción, esto apuntaría al endpoint del Actuator expuesto
            // Por ahora simulamos una respuesta basada en la configuración del Gateway
            const services = ['Gateway', 'Users MS', 'Academic MS', 'Student MS', 'Billing MS', 'Redis', 'Database'];
            const healthData = services.map(name => ({
                name,
                status: Math.random() > 0.1 ? 'online' : 'offline', // Simulación realista
                latency: Math.floor(Math.random() * 100) + 'ms'
            }));
            
            return healthData;
        } catch (error) {
            console.error('Error fetching system health:', error);
            return [];
        }
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
