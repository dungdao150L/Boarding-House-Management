const contractService = require('../src/services/contractService');
const invoiceService = require('../src/services/invoiceService');
const roomService = require('../src/services/roomService');
const tenantService = require('../src/services/tenantService');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('invoiceService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  async function createActiveContract() {
    const room = await roomService.createRoom(db, {
      name: 'C301',
      price: 3500000,
    });
    const tenant = await tenantService.createTenant(db, {
      fullName: 'Tran Thi B',
      phone: '0909000002',
    });

    return contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    });
  }

  test('calculates invoice total from room, electricity, water and service fees', () => {
    const total = invoiceService.calculateInvoiceTotal({
      roomFee: 3000000,
      electricityFee: 250000,
      waterFee: 100000,
      serviceFee: 150000,
    });

    expect(total).toBe(3500000);
  });

  test('creates monthly invoice using contract monthly rent by default', async () => {
    const contract = await createActiveContract();

    const invoice = await invoiceService.createInvoice(db, {
      contractId: contract.id,
      month: '2026-07',
      electricityFee: 200000,
      waterFee: 80000,
      serviceFee: 120000,
    });

    expect(invoice.roomFee).toBe(3500000);
    expect(invoice.totalAmount).toBe(3900000);
    expect(invoice.paymentStatus).toBe('unpaid');
  });

  test('updates payment status to paid', async () => {
    const contract = await createActiveContract();
    const invoice = await invoiceService.createInvoice(db, {
      contractId: contract.id,
      month: '2026-07',
    });

    const updatedInvoice = await invoiceService.updatePaymentStatus(db, invoice.id, 'paid');

    expect(updatedInvoice.paymentStatus).toBe('paid');
  });

  test('lists, gets and updates invoice fees', async () => {
    const contract = await createActiveContract();
    const invoice = await invoiceService.createInvoice(db, {
      contractId: contract.id,
      month: '2026-08',
      electricityFee: 100000,
    });

    const updatedInvoice = await invoiceService.updateInvoice(db, invoice.id, {
      waterFee: 50000,
      serviceFee: 75000,
    });
    const invoices = await invoiceService.listInvoices(db);
    const foundInvoice = await invoiceService.getInvoiceById(db, invoice.id);

    expect(updatedInvoice.totalAmount).toBe(3725000);
    expect(invoices).toHaveLength(1);
    expect(foundInvoice.month).toBe('2026-08');
  });

  test('rejects invalid invoice month', async () => {
    const contract = await createActiveContract();

    await expect(invoiceService.createInvoice(db, {
      contractId: contract.id,
      month: '07-2026',
    })).rejects.toThrow('month must use YYYY-MM format');
  });
});
