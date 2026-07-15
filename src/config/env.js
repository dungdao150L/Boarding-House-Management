require('dotenv').config();

module.exports = {
  billingServiceUrl: process.env.BILLING_SERVICE_URL || 'http://localhost:8000',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
};
