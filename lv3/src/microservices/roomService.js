const contractRoutes = require('../routes/contractRoutes');
const meRoutes = require('../routes/meRoutes');
const roomRoutes = require('../routes/roomRoutes');
const tenantRoutes = require('../routes/tenantRoutes');
const { startService } = require('./startService');

startService({
  mountRoutes: (app) => {
    app.use('/api/rooms', roomRoutes);
    app.use('/api/tenants', tenantRoutes);
    app.use('/api/contracts', contractRoutes);
    app.use('/api/me', meRoutes);
  },
  port: process.env.PORT || 3002,
  serviceName: 'room-service',
});
