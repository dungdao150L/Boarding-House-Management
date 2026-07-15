import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['avg<500', 'p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 25 },
    { duration: '30s', target: 0 },
  ],
};

const AUTH_URL = __ENV.AUTH_URL || 'http://localhost:3001';
const BILLING_URL = __ENV.BILLING_URL || 'http://localhost:3005';
const ROOM_URL = __ENV.ROOM_URL || 'http://localhost:3002';
const REPORT_URL = __ENV.REPORT_URL || 'http://localhost:3003';

function login() {
  const response = http.post(`${AUTH_URL}/api/auth/login`, JSON.stringify({
    password: __ENV.ADMIN_PASSWORD || 'Admin@123',
    username: __ENV.ADMIN_USERNAME || 'admin',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'login returns 200': (res) => res.status === 200,
  });

  return response.json('data.token');
}

export default function () {
  const token = login();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const rooms = http.get(`${ROOM_URL}/api/rooms`, { headers });
  check(rooms, {
    'rooms list returns 200': (res) => res.status === 200,
  });

  const invoice = http.post(`${BILLING_URL}/api/invoices`, JSON.stringify({
    contractId: Number(__ENV.CONTRACT_ID || 1),
    electricityUnitPrice: 3500,
    electricityUsage: 12,
    month: __ENV.BILLING_MONTH || '2026-07',
    serviceFee: 120000,
    waterUnitPrice: 15000,
    waterUsage: 3,
  }), { headers });
  check(invoice, {
    'invoice request is accepted or duplicate-safe': (res) => [201, 400, 409].includes(res.status),
  });

  const report = http.get(`${REPORT_URL}/api/reports/revenue?month=${__ENV.BILLING_MONTH || '2026-07'}`, { headers });
  check(report, {
    'revenue report returns 200': (res) => res.status === 200,
  });

  sleep(1);
}
