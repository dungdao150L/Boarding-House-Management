const AppError = require('../utils/AppError');
const authService = require('../services/authService');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication token is required', 401);
    }

    const tokenUser = await authService.verifyToken(token);
    req.user = await authService.getUserById(req.app.locals.db, tokenUser.id);
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('Forbidden', 403));
      return;
    }

    next();
  };
}

module.exports = { authenticate, authorize };
