import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../config/logger.js';

export const generateToken = (userId, role = 'user') => {
  try {
    const token = jwt.sign(
      { userId, role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE },
    );
    return token;
  } catch (error) {
    logger.error(`Token generation failed: ${error.message}`);
    throw error;
  }
};

export const generateRefreshToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRE },
    );
    return token;
  } catch (error) {
    logger.error(`Refresh token generation failed: ${error.message}`);
    throw error;
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.error(`Refresh token verification failed: ${error.message}`);
    return null;
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
