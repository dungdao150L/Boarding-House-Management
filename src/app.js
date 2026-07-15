const cors = require('cors');
const express = require('express');

const { initializeDatabase, openDatabase } = require('./models/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

async function createApp(options = {}) {
  const app = express();
  const db = options.db || openDatabase();

  await initializeDatabase(db);

  app.locals.db = db;
  app.use(cors());
  app.use(express.json());

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
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
