const authRoutes = require('../routes/authRoutes');
const { startService } = require('./startService');

startService({
  mountRoutes: (app) => {
    app.use('/api/auth', authRoutes);
  },
  port: process.env.PORT || 3001,
  serviceName: 'auth-service',
});
