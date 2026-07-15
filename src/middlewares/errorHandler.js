const AppError = require('../utils/AppError');
const { fail } = require('../utils/response');

function notFoundHandler(req, res) {
  return fail(res, 'Route not found', 404);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    fail(res, error.message, error.statusCode, error.details);
    return;
  }

  if (error.code === 'SQLITE_CONSTRAINT') {
    fail(res, 'Database constraint violation', 400, { reason: error.message });
    return;
  }

  fail(res, 'Internal server error', 500);
}

module.exports = { errorHandler, notFoundHandler };
