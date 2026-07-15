const authService = require('../src/services/authService');
const { closeTestDb, createTestDb } = require('./helpers/testDb');

describe('authService', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  test('bootstraps first admin user and logs in with JWT', async () => {
    const user = await authService.register(db, {
      password: 'Admin@123',
      role: 'admin',
      username: 'admin',
    });
    const login = await authService.login(db, {
      password: 'Admin@123',
      username: 'admin',
    });
    const decoded = await authService.verifyToken(login.token);

    expect(user.role).toBe('admin');
    expect(login.user.username).toBe('admin');
    expect(decoded.role).toBe('admin');
  });

  test('prevents public staff registration after bootstrap', async () => {
    await authService.register(db, {
      password: 'Admin@123',
      role: 'admin',
      username: 'admin',
    });

    await expect(authService.register(db, {
      password: 'Staff@123',
      role: 'staff',
      username: 'staff',
    })).rejects.toThrow('Only admin can create staff or admin users');
  });

  test('rejects invalid login credentials', async () => {
    await authService.register(db, {
      password: 'Admin@123',
      role: 'admin',
      username: 'admin',
    });

    await expect(authService.login(db, {
      password: 'wrong',
      username: 'admin',
    })).rejects.toThrow('Invalid username or password');
  });

  test('admin creates tenant user and lists users', async () => {
    const admin = await authService.register(db, {
      password: 'Admin@123',
      role: 'admin',
      username: 'admin',
    });
    const tenant = await authService.register(db, {
      password: 'Tenant@123',
      role: 'tenant',
      username: 'tenant',
    }, admin);
    const users = await authService.listUsers(db);
    const foundUser = await authService.getUserById(db, tenant.id);

    expect(users).toHaveLength(2);
    expect(foundUser.username).toBe('tenant');
  });

  test('rejects invalid token', async () => {
    await expect(authService.verifyToken('bad-token')).rejects.toThrow('Invalid or expired token');
  });
});
