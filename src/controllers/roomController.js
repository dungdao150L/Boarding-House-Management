const roomService = require('../services/roomService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.app.locals.db, req.body);
  success(res, room, 'Room created', 201);
});

const listRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.listRooms(req.app.locals.db);
  success(res, rooms, 'Rooms retrieved');
});

const getRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.app.locals.db, req.params.id);
  success(res, room, 'Room retrieved');
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.app.locals.db, req.params.id, req.body);
  success(res, room, 'Room updated');
});

const deleteRoom = asyncHandler(async (req, res) => {
  const result = await roomService.deleteRoom(req.app.locals.db, req.params.id);
  success(res, result, 'Room deleted');
});

module.exports = {
  createRoom,
  deleteRoom,
  getRoom,
  listRooms,
  updateRoom,
};
