import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = 'http://localhost:8000';
const myFailRate = new Rate('failed_requests');

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    failed_requests: ['rate<0.1'],
  },
};

export default function () {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/actuator/health`);
    check(res, { 'health is UP': (r) => r.json('status') === 'UP' });
    myFailRate.add(res.status !== 200);
    sleep(0.5);
  });

  group('User Registration', () => {
    const email = `smoke_${Date.now()}@test.com`;
    const payload = JSON.stringify({
      name: 'Smoke User',
      email: email,
      password: 'Test@123',
      phone: '9111111111',
    });
    const res = http.post(`${BASE_URL}/api/v1/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'registration succeeded': (r) => r.status === 201 });
    myFailRate.add(res.status !== 201);
    sleep(0.5);
  });

  group('User Login', () => {
    const payload = JSON.stringify({
      email: 'smoke_login@test.com',
      password: 'Test@123',
    });
    const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'login returned 200-ish': (r) => r.status === 200 || r.status === 401 });
    myFailRate.add(res.status >= 500);
    sleep(0.5);
  });

  group('Public Endpoints', () => {
    const endpoints = [
      '/api/v1/routes',
      '/api/v1/service-cities',
      '/api/v1/recommendations',
    ];
    for (const ep of endpoints) {
      const res = http.get(`${BASE_URL}${ep}`);
      check(res, { [`${ep} OK`]: (r) => r.status === 200 });
      myFailRate.add(res.status >= 500);
      sleep(0.2);
    }
  });

  group('Authenticated Flow', () => {
    const email = `authflow_${Date.now()}@test.com`;
    const registerPayload = JSON.stringify({
      name: 'Auth Flow User',
      email: email,
      password: 'Test@123',
      phone: '9222222222',
    });

    const regRes = http.post(`${BASE_URL}/api/v1/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (regRes.status !== 201) {
      myFailRate.add(1);
      return;
    }

    const loginPayload = JSON.stringify({ email, password: 'Test@123' });
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    myFailRate.add(loginRes.status !== 200);

    if (loginRes.status === 200) {
      const token = loginRes.json('accessToken') || loginRes.json('token');
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const profileRes = http.get(`${BASE_URL}/api/v1/profile`, { headers: authHeaders });
      check(profileRes, { 'profile fetched': (r) => r.status === 200 });
      myFailRate.add(profileRes.status >= 500);
      sleep(0.2);

      const bookingsRes = http.get(`${BASE_URL}/api/v1/bookings`, { headers: authHeaders });
      check(bookingsRes, { 'bookings fetched': (r) => r.status < 500 });
      myFailRate.add(bookingsRes.status >= 500);
      sleep(0.2);

      const blogsRes = http.get(`${BASE_URL}/api/v1/blogs/published`, { headers: authHeaders });
      check(blogsRes, { 'blogs/published fetched': (r) => r.status < 500 });
      myFailRate.add(blogsRes.status >= 500);
    }
  });

  group('Admin Endpoints (non-admin user)', () => {
    const adminEmail = `adminflow_${Date.now()}@test.com`;
    const regPayload = JSON.stringify({
      name: 'Regular User',
      email: adminEmail,
      password: 'Test@123',
      phone: '9333333333',
    });
    http.post(`${BASE_URL}/api/v1/auth/register`, regPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const loginPayload = JSON.stringify({ email: adminEmail, password: 'Test@123' });
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginRes.status === 200) {
      const token = loginRes.json('accessToken') || loginRes.json('token');
      const headers = { Authorization: `Bearer ${token}` };

      const adminEndpoints = [
        '/api/v1/admin/users?page=0&size=5',
        '/api/v1/admin/bookings?page=0&size=5',
        '/api/v1/admin/drivers?page=0&size=5',
        '/api/v1/admin/analytics/dashboard',
        '/api/v1/admin/vehicles',
        '/api/v1/admin/packages',
      ];
      for (const ep of adminEndpoints) {
        const res = http.get(`${BASE_URL}${ep}`, { headers });
        const ok = res.status === 403; // non-admin should get 403
        check(res, { [`admin ${ep} correctly forbidden`]: (r) => ok });
        myFailRate.add(res.status >= 500);
        sleep(0.2);
      }
    } else {
      myFailRate.add(1);
    }
  });
}
