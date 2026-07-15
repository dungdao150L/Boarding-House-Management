const cors = require('cors');
const express = require('express');
const pinoHttp = require('pino-http');

const logger = require('../config/logger');
const { initializeDatabase, openDatabase } = require('../models/database');
const { metricsHandler, metricsMiddleware } = require('../middlewares/metricsMiddleware');
const { errorHandler, notFoundHandler } = require('../middlewares/errorHandler');

async function createServiceApp({ db: providedDb, mountRoutes, serviceName }) {
  const app = express();
  const db = providedDb || openDatabase();

  await initializeDatabase(db);

  app.locals.db = db;
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(metricsMiddleware(serviceName));

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      data: { service: serviceName },
      message: 'Service is healthy',
    });
  });

  mountRoutes(app);
  app.get('/metrics', metricsHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createServiceApp };
