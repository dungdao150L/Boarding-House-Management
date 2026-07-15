const contractService = require('../src/services/contractService');
const roomService = require('../src/services/roomService');
const tenantService = require('../src/services/tenantService');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('contractService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  async function createRoomAndTenant() {
    const room = await roomService.createRoom(db, {
      name: 'B201',
      price: 3000000,
    });
    const tenant = await tenantService.createTenant(db, {
      fullName: 'Nguyen Van A',
      phone: '0909000001',
    });

    return { room, tenant };
  }

  test('creates a contract and marks room as rented', async () => {
    const { room, tenant } = await createRoomAndTenant();

    const contract = await contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
      deposit: 3000000,
    });

    const updatedRoom = await roomService.getRoomById(db, room.id);

    expect(contract.status).toBe('active');
    expect(contract.monthlyRent).toBe(3000000);
    expect(updatedRoom.status).toBe('rented');
  });

  test('does not create a contract for a maintenance room', async () => {
    const { room, tenant } = await createRoomAndTenant();
    await roomService.updateRoom(db, room.id, { status: 'maintenance' });

    await expect(contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    })).rejects.toThrow('Room must be available');
  });

  test('ends a contract and marks room as available', async () => {
    const { room, tenant } = await createRoomAndTenant();
    const contract = await contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    });

    const endedContract = await contractService.endContract(db, contract.id);
    const updatedRoom = await roomService.getRoomById(db, room.id);

    expect(endedContract.status).toBe('ended');
    expect(updatedRoom.status).toBe('available');
  });

  test('lists and updates an active contract', async () => {
    const { room, tenant } = await createRoomAndTenant();
    const contract = await contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    });

    const updatedContract = await contractService.updateContract(db, contract.id, {
      deposit: 1000000,
      monthlyRent: 3200000,
    });
    const contracts = await contractService.listContracts(db);

    expect(updatedContract.deposit).toBe(1000000);
    expect(updatedContract.monthlyRent).toBe(3200000);
    expect(contracts).toHaveLength(1);
    expect(contracts[0].room_name).toBe('B201');
  });

  test('rejects duplicate active contract for the same room', async () => {
    const { room, tenant } = await createRoomAndTenant();
    await contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-07-01',
    });
    await roomService.updateRoom(db, room.id, { status: 'available' });

    await expect(contractService.createContract(db, {
      roomId: room.id,
      tenantId: tenant.id,
      startDate: '2026-08-01',
    })).rejects.toThrow('Room already has an active contract');
  });
});
