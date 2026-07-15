const AppError = require('../utils/AppError');
const { all, get, run } = require('../models/database');
const { requireAllowedValue, requireFields, requireId, requirePositiveNumber } = require('../utils/validation');

const ROOM_STATUSES = ['available', 'rented', 'maintenance'];

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

async function createRoom(db, payload) {
  validateRoomPayload(payload);

  const result = await run(
    db,
    `
      INSERT INTO rooms (name, floor, area, price, status, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      payload.floor ?? null,
      payload.area ?? null,
      payload.price,
      payload.status || 'available',
      payload.description ?? null,
    ],
  );

  return getRoomById(db, result.id);
}

async function listRooms(db) {
  return all(db, 'SELECT * FROM rooms ORDER BY id DESC');
}

async function getRoomById(db, id) {
  const roomId = requireId(id, 'roomId');
  const room = await get(db, 'SELECT * FROM rooms WHERE id = ?', [roomId]);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}

async function updateRoom(db, id, payload) {
  const roomId = requireId(id, 'roomId');
  await getRoomById(db, roomId);
  validateRoomPayload(payload, true);

  const fields = ['name', 'floor', 'area', 'price', 'status', 'description'];
  const entries = fields.filter((field) => payload[field] !== undefined);

  if (entries.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const assignments = entries.map((field) => `${field} = ?`).join(', ');
  const values = entries.map((field) => payload[field]);

  await run(db, `UPDATE rooms SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, roomId]);
  return getRoomById(db, roomId);
}

async function deleteRoom(db, id) {
  const roomId = requireId(id, 'roomId');
  await getRoomById(db, roomId);
  await run(db, 'DELETE FROM rooms WHERE id = ?', [roomId]);

  return { deleted: true };
}

module.exports = {
  ROOM_STATUSES,
  createRoom,
  deleteRoom,
  getRoomById,
  listRooms,
  updateRoom,
};
