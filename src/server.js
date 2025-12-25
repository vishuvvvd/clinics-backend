require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info('server_started', { port: PORT, env: process.env.NODE_ENV });
  });
})();
