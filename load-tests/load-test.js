import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = 'http://localhost:8000';

const failedRequests = new Rate('failed_requests');
const authDuration = new Trend('auth_duration');
const bookingDuration = new Trend('booking_duration');
const adminDuration = new Trend('admin_duration');
const totalBookingsCreated = new Counter('total_bookings_created');

const REGISTERED_USERS = [];
const AUTH_TOKENS = [];

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
    auth_duration: ['p(95)<2000'],
    booking_duration: ['p(95)<3000'],
    admin_duration: ['p(95)<4000'],
    failed_requests: ['rate<0.05'],
  },
};

function getRandomEmail() {
  return `load_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@test.com`;
}

function registerUser() {
  const email = getRandomEmail();
  const payload = JSON.stringify({
    name: 'Load User',
    email: email,
    password: 'Test@123',
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
  });
  const res = http.post(`${BASE_URL}/api/v1/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'register' },
  });
  failedRequests.add(res.status >= 500);
  if (res.status === 201) {
    REGISTERED_USERS.push({ email, password: 'Test@123' });
    return res.json('accessToken') || res.json('token');
  }
  return null;
}

function loginUser(email, password) {
  const payload = JSON.stringify({ email, password });
  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });
  authDuration.add(res.timings.duration);
  failedRequests.add(res.status >= 500);
  if (res.status === 200) {
    const token = res.json('accessToken') || res.json('token');
    AUTH_TOKENS.push(token);
    return token;
  }
  return null;
}

function createBooking(token) {
  const payload = JSON.stringify({
    sourceLocation: 'Mumbai',
    destLocation: 'Pune',
    date: '2026-07-15',
    time: '10:00',
    vehicleType: 'SEDAN',
    pickupAddress: 'Andheri East, Mumbai',
    dropAddress: 'Shivajinagar, Pune',
  });
  const res = http.post(`${BASE_URL}/api/v1/bookings`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    tags: { name: 'create_booking' },
  });
  bookingDuration.add(res.timings.duration);
  failedRequests.add(res.status >= 500);
  if (res.status === 201) totalBookingsCreated.add(1);
  return res;
}

function fetchAdminEndpoints(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const endpoints = [
    { url: '/api/v1/admin/users?page=0&size=10', name: 'admin_users' },
    { url: '/api/v1/admin/bookings?page=0&size=10', name: 'admin_bookings' },
    { url: '/api/v1/admin/drivers?page=0&size=10', name: 'admin_drivers' },
    { url: '/api/v1/admin/analytics/dashboard', name: 'admin_dashboard' },
  ];
  for (const ep of endpoints) {
    const res = http.get(`${BASE_URL}${ep.url}`, {
      headers,
      tags: { name: ep.name },
    });
    adminDuration.add(res.timings.duration);
    failedRequests.add(res.status >= 500);
    sleep(0.1);
  }
}

export function setup() {
  const healthRes = http.get(`${BASE_URL}/actuator/health`);
  check(healthRes, { 'setup: health is UP': (r) => r.json('status') === 'UP' });
  if (healthRes.json('status') !== 'UP') {
    throw new Error('Backend not healthy - aborting load test');
  }
}

export default function () {
  group('Authentication', () => {
    const token = registerUser();
    if (!token) {
      const fallbackToken = loginUser('testuser@loadtest.com', 'Test@123');
      if (fallbackToken) AUTH_TOKENS.push(fallbackToken);
    }
    sleep(0.5);
  });

  const token = AUTH_TOKENS.length > 0
    ? AUTH_TOKENS[Math.floor(Math.random() * AUTH_TOKENS.length)]
    : null;

  group('Create Booking', () => {
    if (token) {
      createBooking(token);
    }
    sleep(0.5);
  });

  group('Fetch Bookings', () => {
    if (token) {
      const res = http.get(`${BASE_URL}/api/v1/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        tags: { name: 'fetch_bookings' },
      });
      failedRequests.add(res.status >= 500);
    }
    sleep(0.3);
  });

  group('User Profile', () => {
    if (token) {
      const res = http.get(`${BASE_URL}/api/v1/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        tags: { name: 'user_profile' },
      });
      failedRequests.add(res.status >= 500);
    }
    sleep(0.3);
  });

  group('Public Endpoints', () => {
    http.get(`${BASE_URL}/api/v1/routes`, { tags: { name: 'public_routes' } });
    sleep(0.2);
    http.get(`${BASE_URL}/api/v1/service-cities`, { tags: { name: 'public_cities' } });
    sleep(0.2);
    http.get(`${BASE_URL}/api/v1/recommendations`, { tags: { name: 'public_recommendations' } });
    sleep(0.2);
  });

  if (__VU <= 5) {
    group('Admin Endpoints', () => {
      const adminToken = loginUser('testuser@loadtest.com', 'Test@123');
      if (adminToken) {
        fetchAdminEndpoints(adminToken);
      }
      sleep(1);
    });
  }

  sleep(1);
}

export function teardown() {
  console.log(`Load test completed. Total bookings created: ${totalBookingsCreated.name}`);
}
