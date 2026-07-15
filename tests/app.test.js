const request = require('supertest');

const { createApp } = require('../src/app');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('REST API', () => {
  let app;
  let db;

  beforeEach(async () => {
    db = await createTestDb();
    app = await createApp({ db });
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  test('returns unified JSON for room creation', async () => {
    const response = await request(app)
      .post('/api/rooms')
      .send({
        name: 'D401',
        price: 2800000,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('D401');
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
      .send({
        fullName: 'API Tenant',
        phone: '0911000000',
      });

    const tenantId = created.body.data.id;
    const list = await request(app).get('/api/tenants');
    const detail = await request(app).get(`/api/tenants/${tenantId}`);
    const updated = await request(app)
      .put(`/api/tenants/${tenantId}`)
      .send({ address: 'Can Tho' });
    const deleted = await request(app).delete(`/api/tenants/${tenantId}`);

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.fullName).toBe('API Tenant');
    expect(updated.body.data.address).toBe('Can Tho');
    expect(deleted.body.data.deleted).toBe(true);
  });

  test('handles contract API lifecycle', async () => {
    const room = await request(app)
      .post('/api/rooms')
      .send({ name: 'E501', price: 4000000 });
    const tenant = await request(app)
      .post('/api/tenants')
      .send({ fullName: 'Contract Tenant', phone: '0911000001' });

    const created = await request(app)
      .post('/api/contracts')
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });
    const contractId = created.body.data.id;
    const list = await request(app).get('/api/contracts');
    const detail = await request(app).get(`/api/contracts/${contractId}`);
    const updated = await request(app)
      .put(`/api/contracts/${contractId}`)
      .send({ deposit: 2000000 });
    const ended = await request(app).patch(`/api/contracts/${contractId}/end`);

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.status).toBe('active');
    expect(updated.body.data.deposit).toBe(2000000);
    expect(ended.body.data.status).toBe('ended');
  });

  test('handles invoice API lifecycle', async () => {
    const room = await request(app)
      .post('/api/rooms')
      .send({ name: 'F601', price: 4200000 });
    const tenant = await request(app)
      .post('/api/tenants')
      .send({ fullName: 'Invoice Tenant', phone: '0911000002' });
    const contract = await request(app)
      .post('/api/contracts')
      .send({
        roomId: room.body.data.id,
        tenantId: tenant.body.data.id,
        startDate: '2026-07-01',
      });

    const created = await request(app)
      .post('/api/invoices')
      .send({
        contractId: contract.body.data.id,
        month: '2026-07',
        electricityFee: 200000,
        waterFee: 90000,
        serviceFee: 110000,
      });
    const invoiceId = created.body.data.id;
    const list = await request(app).get('/api/invoices');
    const detail = await request(app).get(`/api/invoices/${invoiceId}`);
    const updated = await request(app)
      .put(`/api/invoices/${invoiceId}`)
      .send({ serviceFee: 150000 });
    const paid = await request(app)
      .patch(`/api/invoices/${invoiceId}/payment-status`)
      .send({ paymentStatus: 'paid' });

    expect(created.status).toBe(201);
    expect(list.body.data).toHaveLength(1);
    expect(detail.body.data.totalAmount).toBe(4600000);
    expect(updated.body.data.totalAmount).toBe(4640000);
    expect(paid.body.data.paymentStatus).toBe('paid');
  });

  test('handles database constraint errors through centralized middleware', async () => {
    await request(app)
      .post('/api/rooms')
      .send({ name: 'G701', price: 2000000 });

    const duplicate = await request(app)
      .post('/api/rooms')
      .send({ name: 'G701', price: 2100000 });

    expect(duplicate.status).toBe(400);
    expect(duplicate.body.message).toBe('Database constraint violation');
  });
});
