const contractService = require('../src/services/contractService');
const invoiceService = require('../src/services/invoiceService');
const meService = require('../src/services/meService');
const roomService = require('../src/services/roomService');
const tenantService = require('../src/services/tenantService');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('meService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  async function createTenantInvoice() {
    const tenant = await tenantService.createTenant(db, {
      fullName: 'Tenant User',
      phone: '0901000000',
    });
    const room = await roomService.createRoom(db, {
      name: 'ME101',
      price: 2500000,
    });
    const contract = await contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    });
    const invoice = await invoiceService.createInvoice(db, {
      contractId: contract.id,
      month: '2026-07',
      serviceFee: 100000,
    });

    return { invoice, tenant };
  }

  test('rejects invalid tenant self-service access', async () => {
    await expect(meService.getMyRoom(db, { role: 'staff' })).rejects.toThrow('Tenant account is required');
  });

  test('returns not found when tenant has no active room or invoice', async () => {
    const tenant = await tenantService.createTenant(db, {
      fullName: 'No Room Tenant',
      phone: '0902000000',
    });
    const user = { role: 'tenant', tenantId: tenant.id };

    await expect(meService.getMyRoom(db, user)).rejects.toThrow('Active rented room not found');
    await expect(meService.payMyInvoice(db, user, 999)).rejects.toThrow('Invoice not found');
  });

  test('marks tenant invoice as paid and keeps paid invoice stable', async () => {
    const { invoice, tenant } = await createTenantInvoice();
    const user = { role: 'tenant', tenantId: tenant.id };

    const paid = await meService.payMyInvoice(db, user, invoice.id);
    const paidAgain = await meService.payMyInvoice(db, user, invoice.id);

    expect(paid.paymentStatus).toBe('paid');
    expect(paidAgain.paymentStatus).toBe('paid');
  });
});
