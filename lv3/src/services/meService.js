const AppError = require('../utils/AppError');
const { all, get, run } = require('../models/database');
const { requireId } = require('../utils/validation');

function requireTenantUser(user) {
  if (!user || user.role !== 'tenant' || !user.tenantId) {
    throw new AppError('Tenant account is required', 403);
  }
}

async function getMyContracts(db, user) {
  requireTenantUser(user);

  return all(
    db,
    `
      SELECT contracts.*, rooms.room_number AS room_name
      FROM contracts
      JOIN rooms ON rooms.id = contracts.room_id
      WHERE contracts.tenant_id = ?
      ORDER BY contracts.id DESC
    `,
    [user.tenantId],
  );
}

async function getMyInvoices(db, user) {
  requireTenantUser(user);

  const rows = await all(
    db,
    `
      SELECT invoices.*, invoices.status AS payment_status, rooms.room_number AS room_name,
        COALESCE(rent.amount, 0) AS room_fee,
        COALESCE(electricity.quantity, 0) AS electricity_usage,
        COALESCE(electricity.unit_price, 0) AS electricity_unit_price,
        COALESCE(electricity.amount, 0) AS electricity_fee,
        COALESCE(water.quantity, 0) AS water_usage,
        COALESCE(water.unit_price, 0) AS water_unit_price,
        COALESCE(water.amount, 0) AS water_fee,
        COALESCE(service.amount, 0) AS service_fee,
        payments.paid_at AS paid_at
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
      JOIN rooms ON rooms.id = contracts.room_id
      LEFT JOIN invoice_items rent ON rent.invoice_id = invoices.id AND rent.item_type = 'rent'
      LEFT JOIN invoice_items electricity ON electricity.invoice_id = invoices.id AND electricity.item_type = 'electricity'
      LEFT JOIN invoice_items water ON water.invoice_id = invoices.id AND water.item_type = 'water'
      LEFT JOIN invoice_items service ON service.invoice_id = invoices.id AND service.item_type = 'service'
      LEFT JOIN (
        SELECT invoice_id, MAX(payment_date) AS paid_at
        FROM payments
        GROUP BY invoice_id
      ) payments ON payments.invoice_id = invoices.id
      WHERE contracts.tenant_id = ?
      ORDER BY invoices.id DESC
    `,
    [user.tenantId],
  );

  return rows.map(mapInvoice);
}

async function getMyRoom(db, user) {
  requireTenantUser(user);

  const room = await get(
    db,
    `
      SELECT rooms.*, rooms.room_number AS name, rooms.base_price AS price
      FROM rooms
      JOIN contracts ON contracts.room_id = rooms.id
      WHERE contracts.tenant_id = ? AND contracts.status = 'active'
      ORDER BY contracts.id DESC
      LIMIT 1
    `,
    [user.tenantId],
  );

  if (!room) {
    throw new AppError('Active rented room not found', 404);
  }

  return room;
}

async function payMyInvoice(db, user, id) {
  requireTenantUser(user);
  const invoiceId = requireId(id, 'invoiceId');
  const invoice = await get(
    db,
    `
      SELECT invoices.*
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
      WHERE invoices.id = ? AND contracts.tenant_id = ?
    `,
    [invoiceId, user.tenantId],
  );

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (invoice.status !== 'paid') {
    await run(db, 'UPDATE invoices SET paid_amount = total_amount, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      'paid',
      invoiceId,
    ]);
    await run(db, 'INSERT INTO payments (invoice_id, amount, method, note) VALUES (?, ?, ?, ?)', [
      invoiceId,
      invoice.total_amount,
      'bank_transfer',
      'Tenant confirmed payment',
    ]);
  }

  const invoices = await getMyInvoices(db, user);
  return invoices.find((item) => Number(item.id) === invoiceId);
}

function mapInvoice(row) {
  return {
    ...row,
    contractId: row.contract_id,
    electricityFee: Number(row.electricity_fee || 0),
    electricityUnitPrice: Number(row.electricity_unit_price || 0),
    electricityUsage: Number(row.electricity_usage || 0),
    paidAt: row.paid_at,
    paymentStatus: row.payment_status || row.status,
    roomFee: Number(row.room_fee || 0),
    serviceFee: Number(row.service_fee || 0),
    totalAmount: Number(row.total_amount || 0),
    waterFee: Number(row.water_fee || 0),
    waterUnitPrice: Number(row.water_unit_price || 0),
    waterUsage: Number(row.water_usage || 0),
  };
}

module.exports = {
  getMyContracts,
  getMyInvoices,
  getMyRoom,
  payMyInvoice,
};
