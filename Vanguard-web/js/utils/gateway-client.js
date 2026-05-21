class GatewayClient {
    constructor() {
        // API publica por HTTPS para evitar mixed content en el frontend.
        this.baseUrl = 'https://api.wissegt.com/api/v1';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Configuración por defecto de encabezados
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Agregar Token JWT si existe
        const token = AuthManager.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                AuthManager.logout();
                window.location.reload();
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            // Para respuestas vacías (como 204 No Content)
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error(`Error en la petición a ${endpoint}:`, error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Singleton instance
const gateway = new GatewayClient();


