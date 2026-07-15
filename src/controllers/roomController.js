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

const listAvailableRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.listAvailableRooms(req.app.locals.db);
  success(res, rooms, 'Available rooms retrieved');
});

const createRentalRequest = asyncHandler(async (req, res) => {
  const request = await roomService.createRentalRequest(req.app.locals.db, req.user, req.body);
  success(res, request, 'Rental request created', 201);
});

const listRentalRequests = asyncHandler(async (req, res) => {
  const requests = await roomService.listRentalRequests(req.app.locals.db);
  success(res, requests, 'Rental requests retrieved');
});

const updateRentalRequestStatus = asyncHandler(async (req, res) => {
  const request = await roomService.updateRentalRequestStatus(req.app.locals.db, req.params.id, req.body);
  success(res, request, 'Rental request updated');
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
  createRentalRequest,
  deleteRoom,
  getRoom,
  listAvailableRooms,
  listRentalRequests,
  listRooms,
  updateRentalRequestStatus,
  updateRoom,
};
