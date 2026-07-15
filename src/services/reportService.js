const { all, get } = require('../models/database');
const { getCache, setCache } = require('../config/cache');

async function getMonthlyRevenue(db, month) {
  const cacheKey = `report:revenue:${month}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await get(
    db,
    `
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(*) AS invoice_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_count,
        COUNT(CASE WHEN status = 'unpaid' THEN 1 END) AS unpaid_count
      FROM invoices
      WHERE month = ?
    `,
    [month],
  );

  const data = {
    invoiceCount: Number(result.invoice_count || 0),
    month,
    paidCount: Number(result.paid_count || 0),
    totalRevenue: Number(result.total_revenue || 0),
    unpaidCount: Number(result.unpaid_count || 0),
  };

  await setCache(cacheKey, data, 120);
  return data;
}

async function getUnpaidInvoices(db) {
  const cacheKey = 'report:unpaid-invoices';
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const invoices = await all(
    db,
    `
      SELECT invoices.*, invoices.status AS payment_status, tenants.full_name AS tenant_name, rooms.room_number AS room_name
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
      JOIN tenants ON tenants.id = contracts.tenant_id
      JOIN rooms ON rooms.id = contracts.room_id
      WHERE invoices.status = 'unpaid'
      ORDER BY invoices.month DESC, invoices.id DESC
    `,
  );

  await setCache(cacheKey, invoices, 60);
  return invoices;
}

async function getRoomOccupancy(db) {
  const cacheKey = 'report:room-occupancy';
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await get(
    db,
    `
      SELECT
        COUNT(*) AS total_rooms,
        COUNT(CASE WHEN status = 'available' THEN 1 END) AS available_rooms,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) AS rented_rooms,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) AS maintenance_rooms
      FROM rooms
    `,
  );

  const totalRooms = Number(result.total_rooms || 0);
  const data = {
    availableRate: totalRooms === 0 ? 0 : Number(result.available_rooms) / totalRooms,
    availableRooms: Number(result.available_rooms || 0),
    maintenanceRooms: Number(result.maintenance_rooms || 0),
    rentedRooms: Number(result.rented_rooms || 0),
    totalRooms,
  };

  await setCache(cacheKey, data, 120);
  return data;
}

async function createInvoiceNotification(invoice) {
  return {
    channel: 'mock',
    invoiceId: invoice.id,
    message: `Invoice ${invoice.id} for ${invoice.month} is ready`,
    sent: true,
  };
}

module.exports = {
  createInvoiceNotification,
  getMonthlyRevenue,
  getRoomOccupancy,
  getUnpaidInvoices,
};
