const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('mongo_connected', { uri: process.env.MONGO_URI && '***' });
  } catch (err) {
    logger.error('mongo_connection_failed', { error: err.message });
    throw err;
  }
};
