const reportRoutes = require('../routes/reportRoutes');
const { startService } = require('./startService');

startService({
  mountRoutes: (app) => {
    app.use('/api/reports', reportRoutes);
  },
  port: process.env.PORT || 3003,
  serviceName: 'report-service',
});
