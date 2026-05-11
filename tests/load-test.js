import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba
export const options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 200, // 200 peticiones por segundo
            timeUnit: '1s',
            duration: '5m', // Suficiente para llegar a >50k peticiones (200 * 300s = 60,000)
            preAllocatedVUs: 50,
            maxVUs: 100,
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'], // Menos del 1% de errores
        http_req_duration: ['p(95)<500'], // 95% de las peticiones en menos de 500ms
    },
};

const BASE_URL = 'http://localhost:8080';

export default function () {
    // 1. Login (Solo una vez por VU usualmente, pero aquí simulamos flujo completo)
    const loginPayload = JSON.stringify({
        username: 'load_admin',
        password: 'Demo123!',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, params);
    
    check(loginRes, {
        'login exitoso': (r) => r.status === 200,
        'tiene token': (r) => r.json('token') !== undefined,
    });

    const token = loginRes.json('token');
    const authParams = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    // 2. Consulta de catálogo (Operación con Caché y Réplica)
    const coursesRes = http.get(`${BASE_URL}/api/v1/courses`, authParams);
    
    check(coursesRes, {
        'obtener cursos exitoso': (r) => r.status === 200,
    });

    sleep(0.1);
}
