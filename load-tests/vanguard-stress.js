import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.20'],
    http_req_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api.wissegt.com';

const readEndpoints = [
  '/api/v1/courses',
  '/api/v1/grades',
  '/api/v1/majors',
  '/api/v1/school-cycles',
  '/api/v1/students',
  '/api/v1/enrollments',
  '/api/v1/roles',
];

export default function () {
  for (const endpoint of readEndpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`);
    check(res, {
      [`${endpoint} status < 500`]: (r) => r.status < 500,
    });
  }

  sleep(1);
}
