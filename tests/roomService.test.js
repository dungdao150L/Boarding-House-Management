const roomService = require('../src/services/roomService');
const { run } = require('../src/models/database');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('roomService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  test('creates a room with available status by default', async () => {
    const room = await roomService.createRoom(db, {
      name: 'A101',
      floor: 1,
      area: 20,
      price: 2500000,
    });

    expect(room.id).toBeDefined();
    expect(room.name).toBe('A101');
    expect(room.status).toBe('available');
  });

  test('updates room status to maintenance', async () => {
    const room = await roomService.createRoom(db, {
      name: 'A102',
      price: 2300000,
    });

    const updatedRoom = await roomService.updateRoom(db, room.id, {
      status: 'maintenance',
    });

    expect(updatedRoom.status).toBe('maintenance');
  });

  test('lists, gets and deletes a room', async () => {
    const room = await roomService.createRoom(db, {
      name: 'A104',
      price: 2400000,
      description: 'Near stair',
    });

    const rooms = await roomService.listRooms(db);
    const foundRoom = await roomService.getRoomById(db, room.id);
    const result = await roomService.deleteRoom(db, room.id);

    expect(rooms).toHaveLength(1);
    expect(foundRoom.description).toBe('Near stair');
    expect(result.deleted).toBe(true);
    await expect(roomService.getRoomById(db, room.id)).rejects.toThrow('Room not found');
  });

  test('rejects empty update payload', async () => {
    const room = await roomService.createRoom(db, {
      name: 'A105',
      price: 2400000,
    });

    await expect(roomService.updateRoom(db, room.id, {})).rejects.toThrow('No valid fields');
  });

  test('rejects invalid room status', async () => {
    await expect(roomService.createRoom(db, {
      name: 'A103',
      price: 2300000,
      status: 'invalid',
    })).rejects.toThrow('status must be one of');
  });

  test('tenant creates a rental request for an available room', async () => {
    const room = await roomService.createRoom(db, {
      name: 'A106',
      price: 2600000,
    });
    const user = await run(
      db,
      'INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)',
      ['tenant_request', 'hash', 'tenant', 'Tenant Request'],
    );

    const availableRooms = await roomService.listAvailableRooms(db);
    const request = await roomService.createRentalRequest(db, { id: user.id, role: 'tenant' }, { roomId: room.id });
    const updatedRequest = await roomService.updateRentalRequestStatus(db, request.id, { status: 'rejected' });

    expect(availableRooms.map((item) => item.id)).toContain(room.id);
    expect(request.status).toBe('pending');
    expect(updatedRequest.status).toBe('rejected');
  });
});
