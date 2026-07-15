const AppError = require('../utils/AppError');
const { deleteCache, getCache, setCache } = require('../config/cache');
const { all, get, run } = require('../models/database');
const { requireAllowedValue, requireFields, requireId, requirePositiveNumber } = require('../utils/validation');

const ROOM_STATUSES = ['available', 'rented', 'maintenance'];

function toDbRoomStatus(status) {
  return status === 'rented' ? 'occupied' : status;
}

function toApiRoomStatus(status) {
  return status === 'occupied' ? 'rented' : status;
}

function mapRoom(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    name: row.room_number,
    price: Number(row.base_price),
    status: toApiRoomStatus(row.status),
    room_number: undefined,
    base_price: undefined,
  };
}

function validateRoomPayload(payload, partial = false) {
  if (!partial) {
    requireFields(payload, ['name', 'price']);
  }

  if (payload.price !== undefined) {
    requirePositiveNumber(payload.price, 'price');
  }

  if (payload.status !== undefined) {
    requireAllowedValue(payload.status, 'status', ROOM_STATUSES);
  }
}

function requireTenantRole(user) {
  if (!user || user.role !== 'tenant' || !user.id) {
    throw new AppError('Tenant account is required', 403);
  }
}

async function createRoom(db, payload) {
  validateRoomPayload(payload);

  const result = await run(
    db,
    `
      INSERT INTO rooms (room_number, floor, area, base_price, status, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      payload.floor ?? null,
      payload.area ?? null,
      payload.price,
      toDbRoomStatus(payload.status || 'available'),
      payload.description ?? null,
    ],
  );

  await deleteCache('rooms:*');
  await deleteCache('report:*');
  return getRoomById(db, result.id);
}

async function listRooms(db) {
  const cacheKey = 'rooms:list';
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const rows = await all(db, 'SELECT * FROM rooms ORDER BY id DESC');
  const rooms = rows.map(mapRoom);
  await setCache(cacheKey, rooms, 60);
  return rooms;
}

async function listAvailableRooms(db) {
  const rows = await all(db, 'SELECT * FROM rooms WHERE status = ? ORDER BY room_number ASC', ['available']);
  return rows.map(mapRoom);
}

async function createRentalRequest(db, user, payload) {
  requireTenantRole(user);
  const roomId = requireId(payload.roomId, 'roomId');
  const room = await getRoomById(db, roomId);

  if (room.status !== 'available') {
    throw new AppError('Room is not available', 409);
  }

  const existingRequest = await get(
    db,
    'SELECT id FROM rental_requests WHERE user_id = ? AND status = ?',
    [user.id, 'pending'],
  );

  if (existingRequest) {
    throw new AppError('You already have a pending rental request', 409);
  }

  const result = await run(
    db,
    'INSERT INTO rental_requests (user_id, room_id, message) VALUES (?, ?, ?)',
    [user.id, roomId, payload.message ?? null],
  );

  return getRentalRequestById(db, result.id);
}

async function listRentalRequests(db) {
  const rows = await all(
    db,
    `
      SELECT rental_requests.*, users.username, users.full_name, users.email, users.phone,
        rooms.room_number, rooms.floor, rooms.area, rooms.base_price
      FROM rental_requests
      JOIN users ON users.id = rental_requests.user_id
      JOIN rooms ON rooms.id = rental_requests.room_id
      ORDER BY rental_requests.id DESC
    `,
  );

  return rows.map(mapRentalRequest);
}

async function getRentalRequestById(db, id) {
  const requestId = requireId(id, 'requestId');
  const row = await get(
    db,
    `
      SELECT rental_requests.*, users.username, users.full_name, users.email, users.phone,
        rooms.room_number, rooms.floor, rooms.area, rooms.base_price
      FROM rental_requests
      JOIN users ON users.id = rental_requests.user_id
      JOIN rooms ON rooms.id = rental_requests.room_id
      WHERE rental_requests.id = ?
    `,
    [requestId],
  );

  if (!row) {
    throw new AppError('Rental request not found', 404);
  }

  return mapRentalRequest(row);
}

async function updateRentalRequestStatus(db, id, payload) {
  const requestId = requireId(id, 'requestId');
  requireAllowedValue(payload.status, 'status', ['pending', 'approved', 'rejected', 'cancelled']);

  await getRentalRequestById(db, requestId);
  await run(
    db,
    'UPDATE rental_requests SET status = ?, tenant_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [payload.status, payload.tenantId ?? null, requestId],
  );

  return getRentalRequestById(db, requestId);
}

function mapRentalRequest(row) {
  return {
    ...row,
    fullName: row.full_name,
    roomId: row.room_id,
    roomNumber: row.room_number,
    roomPrice: Number(row.base_price || 0),
    tenantId: row.tenant_id,
    userId: row.user_id,
    base_price: undefined,
    full_name: undefined,
    room_id: undefined,
    room_number: undefined,
    tenant_id: undefined,
    user_id: undefined,
  };
}

async function getRoomById(db, id) {
  const roomId = requireId(id, 'roomId');
  const room = await get(db, 'SELECT * FROM rooms WHERE id = ?', [roomId]);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return mapRoom(room);
}

async function updateRoom(db, id, payload) {
  const roomId = requireId(id, 'roomId');
  await getRoomById(db, roomId);
  validateRoomPayload(payload, true);

  const fieldMap = {
    area: 'area',
    description: 'description',
    floor: 'floor',
    name: 'room_number',
    price: 'base_price',
    status: 'status',
  };
  const entries = Object.keys(fieldMap).filter((field) => payload[field] !== undefined);

  if (entries.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${fieldMap[field]} = ?`).join(', ');
  const values = entries.map((field) => (field === 'status' ? toDbRoomStatus(payload[field]) : payload[field]));

  await run(db, `UPDATE rooms SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, roomId]);
  await deleteCache('rooms:*');
  await deleteCache('report:*');
  return getRoomById(db, roomId);
}

async function deleteRoom(db, id) {
  const roomId = requireId(id, 'roomId');
  await getRoomById(db, roomId);
  await run(db, 'DELETE FROM rooms WHERE id = ?', [roomId]);
  await deleteCache('rooms:*');
  await deleteCache('report:*');

  return { deleted: true };
}

module.exports = {
  ROOM_STATUSES,
  createRoom,
  createRentalRequest,
  deleteRoom,
  getRoomById,
  getRentalRequestById,
  listAvailableRooms,
  listRentalRequests,
  listRooms,
  mapRoom,
  toApiRoomStatus,
  toDbRoomStatus,
  updateRentalRequestStatus,
  updateRoom,
};
