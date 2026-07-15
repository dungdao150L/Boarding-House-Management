const AppError = require('./AppError');

function requireFields(payload, fields) {
  const missingFields = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

  if (missingFields.length > 0) {
    throw new AppError('Missing required fields', 400, { fields: missingFields });
  }
}

function requirePositiveNumber(value, fieldName) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new AppError(`${fieldName} must be a positive number`, 400);
  }
}

function requireAllowedValue(value, fieldName, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, 400);
  }
}

function requireId(value, fieldName = 'id') {
  const parsedId = Number(value);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }

  return parsedId;
}

function isValidMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

module.exports = {
  isValidMonth,
  requireAllowedValue,
  requireFields,
  requireId,
  requirePositiveNumber,
};
