const tenantService = require('../src/services/tenantService');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('tenantService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  test('creates, lists and retrieves a tenant', async () => {
    const tenant = await tenantService.createTenant(db, {
      fullName: 'Le Van C',
      phone: '0909000003',
      email: 'c@example.com',
      identityNumber: '123456789012',
      address: 'Ha Noi',
    });

    const tenants = await tenantService.listTenants(db);
    const foundTenant = await tenantService.getTenantById(db, tenant.id);

    expect(tenants).toHaveLength(1);
    expect(foundTenant.fullName).toBe('Le Van C');
    expect(foundTenant.identityNumber).toBe('123456789012');
  });

  test('updates and deletes tenant information', async () => {
    const tenant = await tenantService.createTenant(db, {
      fullName: 'Pham Thi D',
      phone: '0909000004',
    });

    const updatedTenant = await tenantService.updateTenant(db, tenant.id, {
      phone: '0909000999',
      address: 'Da Nang',
    });
    const result = await tenantService.deleteTenant(db, tenant.id);

    expect(updatedTenant.phone).toBe('0909000999');
    expect(updatedTenant.address).toBe('Da Nang');
    expect(result.deleted).toBe(true);
    await expect(tenantService.getTenantById(db, tenant.id)).rejects.toThrow('Tenant not found');
  });

  test('rejects tenant without required fields', async () => {
    await expect(tenantService.createTenant(db, {
      fullName: 'Missing Phone',
    })).rejects.toThrow('Missing required fields');
  });
});
