const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.app.locals.db, req.body, req.user || null);
  success(res, user, 'User registered', 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.app.locals.db, req.body);
  success(res, result, 'Login successful');
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.app.locals.db, req.user.id);
  success(res, user, 'Current user retrieved');
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers(req.app.locals.db);
  success(res, users, 'Users retrieved');
});

module.exports = {
  listUsers,
  login,
  me,
  register,
};
