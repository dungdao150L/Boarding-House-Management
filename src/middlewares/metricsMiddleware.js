const client = require('prom-client');

client.collectDefaultMetrics({
  prefix: 'boarding_',
});

const httpRequestDuration = new client.Histogram({
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  name: 'boarding_http_request_duration_seconds',
});

const httpRequestTotal = new client.Counter({
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  name: 'boarding_http_requests_total',
});

function metricsMiddleware(serviceName) {
  return (req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        service: serviceName,
        status_code: String(res.statusCode),
      };

      httpRequestTotal.inc(labels);
      end(labels);
    });

    next();
  };
}

async function metricsHandler(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}

module.exports = {
  metricsHandler,
  metricsMiddleware,
};
