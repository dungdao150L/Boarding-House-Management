const request = require('supertest');

const { createApp } = require('../src/app');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('REST API', () => {
  let app;
  let adminToken;
  let db;

  beforeEach(async () => {
    db = await createTestDb();
    app = await createApp({ db });

    await request(app)
      .post('/api/auth/register')
      .send({
        password: 'Admin@123',
        role: 'admin',
        username: 'admin',
      });

    const login = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'Admin@123',
        username: 'admin',
      });

    adminToken = login.body.data.token;
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  test('returns unified JSON for room creation', async () => {
    const response = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'D401',
        price: 2800000,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('D401');
  });

  test('handles room API lifecycle', async () => {
    const created = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'D403',
        price: 2900000,
      });
    const roomId = created.body.data.id;
    const list = await request(app).get('/api/rooms').set('Authorization', `Bearer ${adminToken}`);
    const detail = await request(app).get(`/api/rooms/${roomId}`).set('Authorization', `Bearer ${adminToken}`);
    const updated = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'maintenance' });
    const deleted = await request(app).delete(`/api/rooms/${roomId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.name).toBe('D403');
    expect(updated.body.data.status).toBe('maintenance');
    expect(deleted.body.data.deleted).toBe(true);
  });

  test('returns health check and not found responses', async () => {
    const health = await request(app).get('/health');
    const missingRoute = await request(app).get('/api/missing');

    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);
    expect(missingRoute.status).toBe(404);
    expect(missingRoute.body.success).toBe(false);
  });

  test('returns centralized validation error', async () => {
    const response = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'D402',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Missing required fields');
  });

  test('handles tenant API lifecycle', async () => {
    const created = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'API Tenant',
        phone: '0911000000',
      });

    const tenantId = created.body.data.id;
    const list = await request(app).get('/api/tenants').set('Authorization', `Bearer ${adminToken}`);
    const detail = await request(app).get(`/api/tenants/${tenantId}`).set('Authorization', `Bearer ${adminToken}`);
    const updated = await request(app)
      .put(`/api/tenants/${tenantId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ address: 'Can Tho' });
    const deleted = await request(app).delete(`/api/tenants/${tenantId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.fullName).toBe('API Tenant');
    expect(updated.body.data.address).toBe('Can Tho');
    expect(deleted.body.data.deleted).toBe(true);
  });

  test('handles contract API lifecycle', async () => {
    const room = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E501', price: 4000000 });
    const tenant = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Contract Tenant', phone: '0911000001' });

    const created = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });
    const contractId = created.body.data.id;
    const list = await request(app).get('/api/contracts').set('Authorization', `Bearer ${adminToken}`);
    const detail = await request(app).get(`/api/contracts/${contractId}`).set('Authorization', `Bearer ${adminToken}`);
    const updated = await request(app)
      .put(`/api/contracts/${contractId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ deposit: 2000000 });
    const ended = await request(app).patch(`/api/contracts/${contractId}/end`).set('Authorization', `Bearer ${adminToken}`);

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.status).toBe('active');
    expect(updated.body.data.deposit).toBe(2000000);
    expect(ended.body.data.status).toBe('ended');
  });

  test('handles invoice API lifecycle', async () => {
    const room = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'F601', price: 4200000 });
    const tenant = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Invoice Tenant', phone: '0911000002' });
    const contract = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });

    const created = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contractId: contract.body.data.id,
        month: '2026-07',
        electricityFee: 200000,
        waterFee: 90000,
        serviceFee: 110000,
      });
    const invoiceId = created.body.data.id;
    const list = await request(app).get('/api/invoices').set('Authorization', `Bearer ${adminToken}`);
    const detail = await request(app).get(`/api/invoices/${invoiceId}`).set('Authorization', `Bearer ${adminToken}`);
    const updated = await request(app)
      .put(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ serviceFee: 150000 });
    const paid = await request(app)
      .patch(`/api/invoices/${invoiceId}/payment-status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentStatus: 'paid' });

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.totalAmount).toBe(4600000);
    expect(updated.body.data.totalAmount).toBe(4640000);
    expect(paid.body.data.paymentStatus).toBe('paid');
  });

  test('handles report API endpoints', async () => {
    const room = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'R801', price: 2500000 });
    const tenant = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Report Tenant', phone: '0911000004' });
    const contract = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });
    await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contractId: contract.body.data.id,
        electricityUnitPrice: 3500,
        electricityUsage: 10,
        month: '2026-09',
        serviceFee: 100000,
        waterUnitPrice: 15000,
        waterUsage: 2,
      });

    const revenue = await request(app)
      .get('/api/reports/revenue?month=2026-09')
      .set('Authorization', `Bearer ${adminToken}`);
    const unpaidInvoices = await request(app)
      .get('/api/reports/unpaid-invoices')
      .set('Authorization', `Bearer ${adminToken}`);
    const occupancy = await request(app)
      .get('/api/reports/room-occupancy')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(revenue.status).toBe(200);
    expect(revenue.body.data.totalRevenue).toBe(2665000);
    expect(unpaidInvoices.body.data).toHaveLength(1);
    expect(occupancy.body.data.rentedRooms).toBe(1);
  });

  test('handles database constraint errors through centralized middleware', async () => {
    await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'G701', price: 2000000 });

    const duplicate = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'G701', price: 2100000 });

    expect(duplicate.status).toBe(400);
    expect(duplicate.body.message).toBe('Database constraint violation');
  });

  test('enforces RBAC and tenant self-service endpoints', async () => {
    const tenant = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Tenant User', phone: '0911000003' });
    const room = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'T701', price: 3000000 });
    const contract = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });
    await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contractId: contract.body.data.id,
        electricityUnitPrice: 3500,
        electricityUsage: 10,
        month: '2026-07',
        serviceFee: 100000,
        waterUnitPrice: 15000,
        waterUsage: 2,
      });

    await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        password: 'Tenant@123',
        role: 'tenant',
        tenantId: tenant.body.data.id,
        username: 'tenant-user',
      });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Tenant@123', username: 'tenant-user' });
    const tenantToken = login.body.data.token;

    const forbiddenUsers = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${tenantToken}`);
    const myRoom = await request(app)
      .get('/api/me/room')
      .set('Authorization', `Bearer ${tenantToken}`);
    const myContracts = await request(app)
      .get('/api/me/contracts')
      .set('Authorization', `Bearer ${tenantToken}`);
    const myInvoices = await request(app)
      .get('/api/me/invoices')
      .set('Authorization', `Bearer ${tenantToken}`);
    const paidInvoice = await request(app)
      .patch(`/api/me/invoices/${myInvoices.body.data[0].id}/pay`)
      .set('Authorization', `Bearer ${tenantToken}`);

    expect(forbiddenUsers.status).toBe(403);
    expect(myRoom.body.data.name).toBe('T701');
    expect(myContracts.body.data).toHaveLength(1);
    expect(myInvoices.body.data).toHaveLength(1);
    expect(paidInvoice.body.data.paymentStatus).toBe('paid');
  });
});
