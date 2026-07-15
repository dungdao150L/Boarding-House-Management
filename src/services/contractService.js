const AppError = require('../utils/AppError');
const { deleteCache } = require('../config/cache');
const { all, get, run } = require('../models/database');
const { getRoomById, updateRoom } = require('./roomService');
const { getTenantById } = require('./tenantService');
const { requireAllowedValue, requireFields, requireId, requirePositiveNumber } = require('../utils/validation');

const CONTRACT_STATUSES = ['active', 'ended'];

function mapContract(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    roomId: row.room_id,
    tenantId: row.tenant_id,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyRent: Number(row.monthly_rent || 0),
    deposit: Number(row.deposit_amount || 0),
    room_id: undefined,
    tenant_id: undefined,
    start_date: undefined,
    end_date: undefined,
    monthly_rent: undefined,
    deposit_amount: undefined,
  };
}

function validateContractPayload(payload, partial = false) {
  if (!partial) {
    requireFields(payload, ['roomId', 'tenantId', 'startDate']);
  }

  if (payload.deposit !== undefined) {
    requirePositiveNumber(payload.deposit, 'deposit');
  }

  if (payload.monthlyRent !== undefined) {
    requirePositiveNumber(payload.monthlyRent, 'monthlyRent');
  }

  if (payload.status !== undefined) {
    requireAllowedValue(payload.status, 'status', CONTRACT_STATUSES);
  }
}

async function createContract(db, payload) {
  validateContractPayload(payload);

  const room = await getRoomById(db, payload.roomId);
  await getTenantById(db, payload.tenantId);

  if (room.status !== 'available') {
    throw new AppError('Room must be available before creating a contract', 409);
  }

  const activeContract = await get(
    db,
    'SELECT id FROM contracts WHERE room_id = ? AND status = ?',
    [payload.roomId, 'active'],
  );

  if (activeContract) {
    throw new AppError('Room already has an active contract', 409);
  }

  const monthlyRent = payload.monthlyRent ?? room.price;
  requirePositiveNumber(monthlyRent, 'monthlyRent');

  const result = await run(
    db,
    `
      INSERT INTO contracts (room_id, tenant_id, start_date, end_date, deposit_amount, monthly_rent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.roomId,
      payload.tenantId,
      payload.startDate,
      payload.endDate ?? null,
      payload.deposit ?? 0,
      monthlyRent,
      'active',
    ],
  );

  await updateRoom(db, payload.roomId, { status: 'rented' });
  await deleteCache('report:*');
  return getContractById(db, result.id);
}

async function listContracts(db) {
  const rows = await all(
    db,
    `
      SELECT contracts.*, rooms.room_number AS room_name, tenants.full_name AS tenant_name
      FROM contracts
      JOIN rooms ON rooms.id = contracts.room_id
      JOIN tenants ON tenants.id = contracts.tenant_id
      ORDER BY contracts.id DESC
    `,
  );

  return rows.map(mapContract);
}

async function getContractById(db, id) {
  const contractId = requireId(id, 'contractId');
  const contract = await get(
    db,
    `
      SELECT contracts.*, rooms.room_number AS room_name, tenants.full_name AS tenant_name
      FROM contracts
      JOIN rooms ON rooms.id = contracts.room_id
      JOIN tenants ON tenants.id = contracts.tenant_id
      WHERE contracts.id = ?
    `,
    [contractId],
  );

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return mapContract(contract);
}

async function updateContract(db, id, payload) {
  const contractId = requireId(id, 'contractId');
  const contract = await getContractById(db, contractId);
  validateContractPayload(payload, true);

  if (payload.status === 'ended') {
    return endContract(db, contractId);
  }

  const fieldMap = {
    deposit: 'deposit_amount',
    endDate: 'end_date',
    monthlyRent: 'monthly_rent',
    startDate: 'start_date',
  };

  const entries = Object.keys(fieldMap).filter((field) => payload[field] !== undefined);

  if (entries.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${fieldMap[field]} = ?`).join(', ');
  const values = entries.map((field) => payload[field]);

  await run(db, `UPDATE contracts SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, contractId]);

  if (contract.status === 'ended') {
    await updateRoom(db, contract.roomId, { status: 'available' });
  }

  return getContractById(db, contractId);
}

async function endContract(db, id) {
  const contractId = requireId(id, 'contractId');
  const contract = await getContractById(db, contractId);

  await run(
    db,
    `
      UPDATE contracts
      SET status = 'ended',
          end_date = COALESCE(end_date, CURRENT_DATE),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [contractId],
  );

  await updateRoom(db, contract.roomId, { status: 'available' });
  await deleteCache('report:*');
  return getContractById(db, contractId);
}

module.exports = {
  CONTRACT_STATUSES,
  createContract,
  endContract,
  getContractById,
  listContracts,
  updateContract,
};
