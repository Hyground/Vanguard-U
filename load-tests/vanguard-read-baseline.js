import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.wissegt.com';

const endpoints = [
  '/actuator/health',
  '/api/v1/courses',
  '/api/v1/grades',
  '/api/v1/majors',
  '/api/v1/school-cycles',
  '/api/v1/students',
  '/api/v1/enrollments',
  '/api/v1/roles',
];

export default function () {
  for (const endpoint of endpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`);
    check(res, {
      [`${endpoint} status < 500`]: (r) => r.status < 500,
    });
  }

  sleep(1);
}
