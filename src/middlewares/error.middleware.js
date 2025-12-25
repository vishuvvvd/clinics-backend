const logger = require('../utils/logger');

function notFound(_req, res) {
  return res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  logger.error('request_error', { error: err.message });
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal Server Error'
  });
}

module.exports = { notFound, errorHandler };
