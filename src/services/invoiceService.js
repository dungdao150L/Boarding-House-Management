const AppError = require('../utils/AppError');
const { deleteCache } = require('../config/cache');
const { all, get, run } = require('../models/database');
const { calculateBilling } = require('./billingClient');
const { getContractById } = require('./contractService');
const { isValidMonth, requireAllowedValue, requireFields, requireId, requirePositiveNumber } = require('../utils/validation');

const PAYMENT_STATUSES = ['unpaid', 'paid'];

function calculateInvoiceTotal({ roomFee = 0, electricityFee = 0, waterFee = 0, serviceFee = 0 }) {
  [roomFee, electricityFee, waterFee, serviceFee].forEach((value) => {
    requirePositiveNumber(value, 'fee');
  });

  return roomFee + electricityFee + waterFee + serviceFee;
}

function mapInvoice(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    contractId: row.contract_id,
    meterReadingId: row.meter_reading_id,
    roomFee: Number(row.room_fee || 0),
    electricityUsage: Number(row.electricity_usage || 0),
    electricityUnitPrice: Number(row.electricity_unit_price || 0),
    electricityFee: Number(row.electricity_fee || 0),
    waterUsage: Number(row.water_usage || 0),
    waterUnitPrice: Number(row.water_unit_price || 0),
    waterFee: Number(row.water_fee || 0),
    serviceFee: Number(row.service_fee || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentStatus: row.payment_status || row.status,
    paidAt: row.paid_at,
    contract_id: undefined,
    meter_reading_id: undefined,
    room_fee: undefined,
    electricity_usage: undefined,
    electricity_unit_price: undefined,
    electricity_fee: undefined,
    water_usage: undefined,
    water_unit_price: undefined,
    water_fee: undefined,
    service_fee: undefined,
    total_amount: undefined,
    payment_status: undefined,
    paid_at: undefined,
  };
}

function validateInvoicePayload(payload, partial = false) {
  if (!partial) {
    requireFields(payload, ['contractId', 'month']);
  }

  if (payload.month !== undefined && !isValidMonth(payload.month)) {
    throw new AppError('month must use YYYY-MM format', 400);
  }

  [
    'roomFee',
    'electricityFee',
    'electricityUsage',
    'electricityUnitPrice',
    'waterFee',
    'waterUsage',
    'waterUnitPrice',
    'serviceFee',
  ].forEach((field) => {
    if (payload[field] !== undefined) {
      requirePositiveNumber(payload[field], field);
    }
  });

  if (payload.paymentStatus !== undefined) {
    requireAllowedValue(payload.paymentStatus, 'paymentStatus', PAYMENT_STATUSES);
  }
}

async function createInvoice(db, payload) {
  validateInvoicePayload(payload);

  const contract = await getContractById(db, payload.contractId);
  const roomFee = payload.roomFee ?? contract.monthlyRent;
  const electricityUsage = payload.electricityUsage ?? 0;
  const electricityUnitPrice = payload.electricityUnitPrice ?? 0;
  const waterUsage = payload.waterUsage ?? 0;
  const waterUnitPrice = payload.waterUnitPrice ?? 0;
  const serviceFee = payload.serviceFee ?? 0;
  const billingResult = await calculateBilling({
    electricityUnitPrice,
    electricityUsage,
    roomFee,
    serviceFee,
    waterUnitPrice,
    waterUsage,
  });

  const electricityFee = payload.electricityFee ?? billingResult.electricityFee;
  const waterFee = payload.waterFee ?? billingResult.waterFee;
  const totalAmount = calculateInvoiceTotal({ roomFee, electricityFee, waterFee, serviceFee });

  const meterReading = await upsertUtilityReading(db, {
    electricityUnitPrice,
    electricityUsage,
    month: payload.month,
    roomId: contract.roomId,
    waterUnitPrice,
    waterUsage,
  });

  const result = await run(
    db,
    `
      INSERT INTO invoices (
        room_id, tenant_id, contract_id, month, issue_date,
        total_amount, paid_amount, status, note
      )
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, ?)
    `,
    [
      contract.roomId,
      contract.tenantId,
      payload.contractId,
      payload.month,
      totalAmount,
      payload.paymentStatus === 'paid' ? totalAmount : 0,
      payload.paymentStatus || 'unpaid',
      payload.note ?? null,
    ],
  );

  await replaceInvoiceItems(db, result.id, {
    electricityFee,
    electricityUnitPrice,
    electricityUsage,
    month: payload.month,
    roomFee,
    serviceFee,
    waterFee,
    waterUnitPrice,
    waterUsage,
  });

  await deleteCache('report:*');
  const invoice = await getInvoiceById(db, result.id);
  return { ...invoice, meterReadingId: meterReading.id };
}

async function listInvoices(db) {
  const rows = await all(
    db,
    `
      ${invoiceSelectSql()}
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
      ${invoiceJoinSql()}
      ORDER BY invoices.id DESC
    `,
  );

  return rows.map(mapInvoice);
}

async function getInvoiceById(db, id) {
  const invoiceId = requireId(id, 'invoiceId');
  const invoice = await get(
    db,
    `
      ${invoiceSelectSql()}
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
      ${invoiceJoinSql()}
      WHERE invoices.id = ?
    `,
    [invoiceId],
  );

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  return mapInvoice(invoice);
}

async function updateInvoice(db, id, payload) {
  const invoiceId = requireId(id, 'invoiceId');
  const currentInvoice = await getInvoiceById(db, invoiceId);
  validateInvoicePayload(payload, true);

  const nextInvoice = {
    roomFee: payload.roomFee ?? currentInvoice.roomFee,
    electricityFee: payload.electricityFee ?? currentInvoice.electricityFee,
    electricityUsage: payload.electricityUsage ?? currentInvoice.electricityUsage,
    electricityUnitPrice: payload.electricityUnitPrice ?? currentInvoice.electricityUnitPrice,
    waterFee: payload.waterFee ?? currentInvoice.waterFee,
    waterUsage: payload.waterUsage ?? currentInvoice.waterUsage,
    waterUnitPrice: payload.waterUnitPrice ?? currentInvoice.waterUnitPrice,
    serviceFee: payload.serviceFee ?? currentInvoice.serviceFee,
  };
  const totalAmount = calculateInvoiceTotal(nextInvoice);

  const fieldMap = {
    month: 'month',
    paymentStatus: 'status',
  };

  const entries = Object.keys(fieldMap).filter((field) => payload[field] !== undefined);

  const hasFeeUpdate = [
    'electricityFee',
    'electricityUsage',
    'electricityUnitPrice',
    'roomFee',
    'serviceFee',
    'waterFee',
    'waterUsage',
    'waterUnitPrice',
  ].some((field) => payload[field] !== undefined);

  if (entries.length === 0 && !hasFeeUpdate) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${fieldMap[field]} = ?`).concat([
    'total_amount = ?',
    'paid_amount = CASE WHEN status = ? THEN ? ELSE paid_amount END',
  ]).join(', ');
  const values = entries.map((field) => payload[field]);

  await run(
    db,
    `UPDATE invoices SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, totalAmount, 'paid', totalAmount, invoiceId],
  );

  if (hasFeeUpdate) {
    await replaceInvoiceItems(db, invoiceId, {
      ...nextInvoice,
      month: payload.month ?? currentInvoice.month,
    });

    await upsertUtilityReading(db, {
      electricityUnitPrice: nextInvoice.electricityUnitPrice,
      electricityUsage: nextInvoice.electricityUsage,
      month: payload.month ?? currentInvoice.month,
      roomId: currentInvoice.room_id,
      waterUnitPrice: nextInvoice.waterUnitPrice,
      waterUsage: nextInvoice.waterUsage,
    });
  }

  await deleteCache('report:*');
  return getInvoiceById(db, invoiceId);
}

async function updatePaymentStatus(db, id, paymentStatus) {
  const invoice = await updateInvoice(db, id, { paymentStatus });

  if (paymentStatus === 'paid') {
    await run(db, 'UPDATE invoices SET paid_amount = total_amount, status = ? WHERE id = ?', ['paid', invoice.id]);
    await run(
      db,
      'INSERT INTO payments (invoice_id, amount, method, note) VALUES (?, ?, ?, ?)',
      [invoice.id, invoice.totalAmount, 'cash', 'Marked as paid'],
    );
    await deleteCache('report:*');
    return getInvoiceById(db, invoice.id);
  }

  await run(db, 'UPDATE invoices SET paid_amount = 0, status = ? WHERE id = ?', ['unpaid', invoice.id]);
  await deleteCache('report:*');
  return getInvoiceById(db, invoice.id);
}

function invoiceSelectSql() {
  return `
    SELECT invoices.*,
      invoices.status AS payment_status,
      contracts.room_id,
      contracts.tenant_id,
      utility_readings.id AS meter_reading_id,
      COALESCE(rent.amount, 0) AS room_fee,
      COALESCE(electricity.quantity, 0) AS electricity_usage,
      COALESCE(electricity.unit_price, 0) AS electricity_unit_price,
      COALESCE(electricity.amount, 0) AS electricity_fee,
      COALESCE(water.quantity, 0) AS water_usage,
      COALESCE(water.unit_price, 0) AS water_unit_price,
      COALESCE(water.amount, 0) AS water_fee,
      COALESCE(service.amount, 0) AS service_fee,
      payments.paid_at AS paid_at
  `;
}

function invoiceJoinSql() {
  return `
    LEFT JOIN utility_readings
      ON utility_readings.room_id = invoices.room_id
      AND utility_readings.month = invoices.month
    LEFT JOIN invoice_items rent
      ON rent.invoice_id = invoices.id
      AND rent.item_type = 'rent'
    LEFT JOIN invoice_items electricity
      ON electricity.invoice_id = invoices.id
      AND electricity.item_type = 'electricity'
    LEFT JOIN invoice_items water
      ON water.invoice_id = invoices.id
      AND water.item_type = 'water'
    LEFT JOIN invoice_items service
      ON service.invoice_id = invoices.id
      AND service.item_type = 'service'
    LEFT JOIN (
      SELECT invoice_id, MAX(payment_date) AS paid_at
      FROM payments
      GROUP BY invoice_id
    ) payments ON payments.invoice_id = invoices.id
  `;
}

async function upsertUtilityReading(db, payload) {
  const existing = await get(
    db,
    'SELECT id FROM utility_readings WHERE room_id = ? AND month = ?',
    [payload.roomId, payload.month],
  );

  if (existing) {
    await run(
      db,
      `
        UPDATE utility_readings
        SET electricity_old = 0,
            electricity_new = ?,
            electricity_unit_price = ?,
            water_old = 0,
            water_new = ?,
            water_unit_price = ?
        WHERE id = ?
      `,
      [
        payload.electricityUsage,
        payload.electricityUnitPrice,
        payload.waterUsage,
        payload.waterUnitPrice,
        existing.id,
      ],
    );
    return existing;
  }

  const result = await run(
    db,
    `
      INSERT INTO utility_readings (
        room_id, month, electricity_old, electricity_new,
        electricity_unit_price, water_old, water_new, water_unit_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.roomId,
      payload.month,
      0,
      payload.electricityUsage,
      payload.electricityUnitPrice,
      0,
      payload.waterUsage,
      payload.waterUnitPrice,
    ],
  );

  return { id: result.id };
}

async function replaceInvoiceItems(db, invoiceId, payload) {
  await run(db, 'DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId]);

  const items = [
    ['rent', `Room rent ${payload.month}`, 1, payload.roomFee, payload.roomFee],
    ['electricity', `Electricity ${payload.month}`, payload.electricityUsage, payload.electricityUnitPrice, payload.electricityFee],
    ['water', `Water ${payload.month}`, payload.waterUsage, payload.waterUnitPrice, payload.waterFee],
    ['service', `Service fee ${payload.month}`, 1, payload.serviceFee, payload.serviceFee],
  ];

  await Promise.all(items.map((item) => run(
    db,
    'INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)',
    [invoiceId, ...item],
  )));
}

module.exports = {
  PAYMENT_STATUSES,
  calculateInvoiceTotal,
  createInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoice,
  updatePaymentStatus,
};
