const invoiceRoutes = require('../routes/invoiceRoutes');
const { startService } = require('./startService');

startService({
  mountRoutes: (app) => {
    app.use('/api/invoices', invoiceRoutes);
  },
  port: process.env.PORT || 3005,
  serviceName: 'billing-service',
});
