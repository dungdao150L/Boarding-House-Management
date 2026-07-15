const axios = require('axios');

const config = require('../config/env');
const logger = require('../config/logger');

function calculateLocally(payload) {
  const electricityFee = payload.electricityUsage * payload.electricityUnitPrice;
  const waterFee = payload.waterUsage * payload.waterUnitPrice;
  const totalAmount = payload.roomFee + electricityFee + waterFee + payload.serviceFee;

  return {
    electricityFee,
    totalAmount,
    waterFee,
  };
}

async function calculateBilling(payload) {
  if (process.env.NODE_ENV === 'test') {
    return calculateLocally(payload);
  }

  try {
    const response = await axios.post(`${config.billingServiceUrl}/calculate`, payload, {
      timeout: Number(process.env.BILLING_TIMEOUT_MS || 3000),
    });

    return response.data;
  } catch (error) {
    if (process.env.BILLING_FALLBACK !== 'false') {
      logger.warn({
        error: error.message,
        billingServiceUrl: config.billingServiceUrl,
      }, 'Billing service unavailable, using local fallback');

      return calculateLocally(payload);
    }

    throw error;
  }
}

module.exports = { calculateBilling, calculateLocally };
