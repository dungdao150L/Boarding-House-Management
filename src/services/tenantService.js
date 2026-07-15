const AppError = require('../utils/AppError');
const { all, get, run } = require('../models/database');
const { requireFields, requireId } = require('../utils/validation');

function validateTenantPayload(payload, partial = false) {
  if (!partial) {
    requireFields(payload, ['fullName', 'phone']);
  }
}

function mapTenant(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    fullName: row.full_name,
    identityNumber: row.identity_number,
    full_name: undefined,
    identity_number: undefined,
  };
}

async function createTenant(db, payload) {
  validateTenantPayload(payload);

  const supportsReturning = db.__dialect === 'postgres-test';
  const result = await run(
    db,
    `
      INSERT INTO tenants (user_id, full_name, phone, email, identity_number, address)
      VALUES (?, ?, ?, ?, ?, ?)
      ${supportsReturning ? 'RETURNING id' : ''}
    `,
    [
      payload.userId ?? null,
      payload.fullName,
      payload.phone,
      payload.email ?? null,
      payload.identityNumber ?? null,
      payload.address ?? null,
    ],
  );

  return getTenantById(db, result.id);
}

async function listTenants(db) {
  const rows = await all(db, 'SELECT * FROM tenants ORDER BY id DESC');
  return rows.map(mapTenant);
}

async function getTenantById(db, id) {
  const tenantId = requireId(id, 'tenantId');
  const tenant = await get(db, 'SELECT * FROM tenants WHERE id = ?', [tenantId]);

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return mapTenant(tenant);
}

async function updateTenant(db, id, payload) {
  const tenantId = requireId(id, 'tenantId');
  await getTenantById(db, tenantId);
  validateTenantPayload(payload, true);

  const fieldMap = {
    address: 'address',
    email: 'email',
    fullName: 'full_name',
    identityNumber: 'identity_number',
    phone: 'phone',
  };

  const entries = Object.keys(fieldMap).filter((field) => payload[field] !== undefined);

  if (entries.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${fieldMap[field]} = ?`).join(', ');
  const values = entries.map((field) => payload[field]);

  await run(db, `UPDATE tenants SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, tenantId]);
  return getTenantById(db, tenantId);
}

async function deleteTenant(db, id) {
  const tenantId = requireId(id, 'tenantId');
  await getTenantById(db, tenantId);
  await run(db, 'DELETE FROM tenants WHERE id = ?', [tenantId]);

  return { deleted: true };
}

module.exports = {
  createTenant,
  deleteTenant,
  getTenantById,
  listTenants,
  updateTenant,
};
