const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config/env');
const AppError = require('../utils/AppError');
const { all, get, run } = require('../models/database');
const { requireAllowedValue, requireFields, requireId } = require('../utils/validation');

const USER_ROLES = ['admin', 'staff', 'tenant'];

function sanitizeUser(user) {
  if (!user) {
    return user;
  }

  const safeUser = { ...user };
  delete safeUser.password_hash;
  return {
    ...safeUser,
    tenantId: user.tenant_id,
    tenant_id: undefined,
    passwordHash: undefined,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tenantId: user.tenant_id || user.tenantId || null,
      username: user.username,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
}

async function register(db, payload, actor = null) {
  requireFields(payload, ['username', 'password', 'role']);
  requireAllowedValue(payload.role, 'role', USER_ROLES);

  const existingUsers = await get(db, 'SELECT COUNT(*) AS count FROM users');
  const isBootstrapUser = Number(existingUsers.count) === 0;

  if (payload.role !== 'tenant' && !isBootstrapUser && (!actor || actor.role !== 'admin')) {
    throw new AppError('Only admin can create staff or admin users', 403);
  }

  if (payload.role === 'tenant' && payload.tenantId !== undefined) {
    requireId(payload.tenantId, 'tenantId');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const result = await run(
    db,
    `
      INSERT INTO users (username, password_hash, role, full_name, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.username,
      passwordHash,
      payload.role,
      payload.fullName || payload.username,
      payload.email ?? null,
      payload.phone ?? null,
    ],
  );

  if (payload.role === 'tenant') {
    if (payload.tenantId !== undefined) {
      await run(db, 'UPDATE tenants SET user_id = ? WHERE id = ?', [result.id, payload.tenantId]);
    } else if (payload.email) {
      const tenant = await get(db, 'SELECT id FROM tenants WHERE email = ? AND user_id IS NULL', [payload.email]);
      if (tenant) {
        await run(db, 'UPDATE tenants SET user_id = ? WHERE id = ?', [result.id, tenant.id]);
      }
    }
  }

  return getUserById(db, result.id);
}

async function login(db, payload) {
  requireFields(payload, ['username', 'password']);

  const user = await get(
    db,
    `
      SELECT users.*, tenants.id AS tenant_id
      FROM users
      LEFT JOIN tenants ON tenants.user_id = users.id
      WHERE users.username = ?
    `,
    [payload.username],
  );
  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid username or password', 401);
  }

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

async function listUsers(db) {
  const rows = await all(
    db,
    `
      SELECT users.*, tenants.id AS tenant_id
      FROM users
      LEFT JOIN tenants ON tenants.user_id = users.id
      ORDER BY users.id DESC
    `,
  );
  return rows.map(sanitizeUser);
}

async function getUserById(db, id) {
  const userId = requireId(id, 'userId');
  const user = await get(
    db,
    `
      SELECT users.*, tenants.id AS tenant_id
      FROM users
      LEFT JOIN tenants ON tenants.user_id = users.id
      WHERE users.id = ?
    `,
    [userId],
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(user);
}

module.exports = {
  USER_ROLES,
  getUserById,
  listUsers,
  login,
  register,
  sanitizeUser,
  verifyToken,
};
