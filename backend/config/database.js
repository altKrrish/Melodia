import mongoose from 'mongoose';
import config from './index.js';
import logger from './logger.js';

const mongooseOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
};

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, mongooseOptions);
    logger.info('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection failed: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
export default connectDB;
