const AppError = require('../utils/AppError');
const { all, get, run } = require('../models/database');
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
    roomFee: row.room_fee,
    electricityFee: row.electricity_fee,
    waterFee: row.water_fee,
    serviceFee: row.service_fee,
    totalAmount: row.total_amount,
    paymentStatus: row.payment_status,
    contract_id: undefined,
    room_fee: undefined,
    electricity_fee: undefined,
    water_fee: undefined,
    service_fee: undefined,
    total_amount: undefined,
    payment_status: undefined,
  };
}

function validateInvoicePayload(payload, partial = false) {
  if (!partial) {
    requireFields(payload, ['contractId', 'month']);
  }

  if (payload.month !== undefined && !isValidMonth(payload.month)) {
    throw new AppError('month must use YYYY-MM format', 400);
  }

  ['roomFee', 'electricityFee', 'waterFee', 'serviceFee'].forEach((field) => {
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
  const electricityFee = payload.electricityFee ?? 0;
  const waterFee = payload.waterFee ?? 0;
  const serviceFee = payload.serviceFee ?? 0;
  const totalAmount = calculateInvoiceTotal({ roomFee, electricityFee, waterFee, serviceFee });

  const result = await run(
    db,
    `
      INSERT INTO invoices (
        contract_id, month, room_fee, electricity_fee, water_fee,
        service_fee, total_amount, payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.contractId,
      payload.month,
      roomFee,
      electricityFee,
      waterFee,
      serviceFee,
      totalAmount,
      payload.paymentStatus || 'unpaid',
    ],
  );

  return getInvoiceById(db, result.id);
}

async function listInvoices(db) {
  const rows = await all(
    db,
    `
      SELECT invoices.*, contracts.room_id, contracts.tenant_id
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
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
      SELECT invoices.*, contracts.room_id, contracts.tenant_id
      FROM invoices
      JOIN contracts ON contracts.id = invoices.contract_id
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
    waterFee: payload.waterFee ?? currentInvoice.waterFee,
    serviceFee: payload.serviceFee ?? currentInvoice.serviceFee,
  };
  const totalAmount = calculateInvoiceTotal(nextInvoice);

  const fieldMap = {
    electricityFee: 'electricity_fee',
    month: 'month',
    paymentStatus: 'payment_status',
    roomFee: 'room_fee',
    serviceFee: 'service_fee',
    waterFee: 'water_fee',
  };

  const entries = Object.keys(fieldMap).filter((field) => payload[field] !== undefined);

  if (entries.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${fieldMap[field]} = ?`).join(', ');
  const values = entries.map((field) => payload[field]);

  await run(
    db,
    `UPDATE invoices SET ${assignments}, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, totalAmount, invoiceId],
  );

  return getInvoiceById(db, invoiceId);
}

async function updatePaymentStatus(db, id, paymentStatus) {
  return updateInvoice(db, id, { paymentStatus });
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
