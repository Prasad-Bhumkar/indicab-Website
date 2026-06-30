import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://localhost:8000';
const failedRequests = new Rate('failed_requests');
const responseTime = new Trend('response_time');

const USERS = [];
for (let i = 0; i < 20; i++) {
  USERS.push({
    email: `stress_user_${i}@test.com`,
    password: 'Test@123',
    name: `Stress User ${i}`,
    phone: `9000000${String(i).padStart(3, '0')}`,
  });
}

export const options = {
  scenarios: {
    ramp_up: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '2m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.10'],
    failed_requests: ['rate<0.10'],
  },
};

function getRandomUser() {
  return USERS[Math.floor(Math.random() * USERS.length)];
}

function loginUser(user) {
  const res = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'stress_login' },
  });
  responseTime.add(res.timings.duration);
  failedRequests.add(res.status >= 500);
  if (res.status === 200) {
    return res.json('accessToken') || res.json('token');
  }
  return null;
}

function registerIfNeeded(user) {
  const registerRes = http.post(`${BASE_URL}/api/v1/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'stress_register' },
  });
  responseTime.add(registerRes.timings.duration);
  return registerRes.status === 201 || registerRes.status === 409;
}

export function setup() {
  const healthRes = http.get(`${BASE_URL}/actuator/health`);
  check(healthRes, { 'health is UP': (r) => r.json('status') === 'UP' });

  for (const user of USERS) {
    registerIfNeeded(user);
  }
}

export default function () {
  const user = getRandomUser();
  const token = loginUser(user);

  if (token) {
    const scenario = Math.floor(Math.random() * 5);
    const headers = { Authorization: `Bearer ${token}` };

    switch (scenario) {
      case 0:
        group('Profile', () => {
          const res = http.get(`${BASE_URL}/api/v1/profile`, { headers, tags: { name: 'stress_profile' } });
          responseTime.add(res.timings.duration);
          failedRequests.add(res.status >= 500);
        });
        break;

      case 1:
        group('Create Booking', () => {
          const res = http.post(`${BASE_URL}/api/v1/bookings`, JSON.stringify({
            sourceLocation: 'Mumbai',
            destLocation: 'Pune',
            date: '2026-07-20',
            time: '10:00',
            vehicleType: 'SEDAN',
            pickupAddress: 'Andheri',
            dropAddress: 'Shivajinagar',
          }), { headers: { ...headers, 'Content-Type': 'application/json' }, tags: { name: 'stress_create_booking' } });
          responseTime.add(res.timings.duration);
          failedRequests.add(res.status >= 500);
        });
        break;

      case 2:
        group('Fetch Bookings', () => {
          const res = http.get(`${BASE_URL}/api/v1/bookings`, { headers, tags: { name: 'stress_fetch_bookings' } });
          responseTime.add(res.timings.duration);
          failedRequests.add(res.status >= 500);
        });
        break;

      case 3:
        group('Admin Users', () => {
          const res = http.get(`${BASE_URL}/api/v1/admin/users?page=0&size=10`, {
            headers,
            tags: { name: 'stress_admin_users' },
          });
          responseTime.add(res.timings.duration);
          failedRequests.add(res.status);
          if (res.status === 403) failedRequests.add(0);
        });
        break;

      case 4:
        group('Public Data', () => {
          http.get(`${BASE_URL}/api/v1/routes`, { tags: { name: 'stress_routes' } });
          http.get(`${BASE_URL}/api/v1/service-cities`, { tags: { name: 'stress_cities' } });
          http.get(`${BASE_URL}/api/v1/recommendations`, { tags: { name: 'stress_recommendations' } });
        });
        break;
    }
  }

  sleep(Math.random() * 0.5 + 0.2);
}
