const { createServiceApp } = require('./createServiceApp');

function startService({ mountRoutes, port, serviceName }) {
  createServiceApp({ mountRoutes, serviceName })
    .then((app) => {
      app.listen(port, () => {
        console.log(`${serviceName} is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error(`Failed to start ${serviceName}:`, error);
      process.exit(1);
    });
}

module.exports = { startService };
