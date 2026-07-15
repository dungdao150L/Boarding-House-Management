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

  const constraintErrors = [
    'SQLITE_CONSTRAINT',
    '23505',
    '23503',
    '23514',
    'ER_DUP_ENTRY',
    'ER_NO_REFERENCED_ROW_2',
    'ER_ROW_IS_REFERENCED_2',
    'ER_CHECK_CONSTRAINT_VIOLATED',
  ];

  if (constraintErrors.includes(error.code)) {
    fail(res, 'Database constraint violation', 400, { reason: error.message });
    return;
  }

  fail(res, 'Internal server error', 500);
}

module.exports = { errorHandler, notFoundHandler };
