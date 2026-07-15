const cors = require('cors');
const express = require('express');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const { initializeDatabase, openDatabase } = require('./models/database');
const { metricsHandler, metricsMiddleware } = require('./middlewares/metricsMiddleware');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

async function createApp(options = {}) {
  const app = express();
  const db = options.db || openDatabase();

  await initializeDatabase(db);

  app.locals.db = db;
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(metricsMiddleware(options.serviceName || 'backend-node'));

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Service is healthy',
      data: {
        service: 'boarding-house-management',
      },
    });
  });

  app.use('/api', routes);
  app.get('/metrics', metricsHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
