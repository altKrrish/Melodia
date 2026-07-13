import redis from 'redis';
import config from './index.js';
import logger from './logger.js';

let redisClient;

export const initializeRedis = async () => {
  try {
    if (!config.REDIS_URL) {
      logger.warn('Redis URL not configured, caching disabled');
      return null;
    }

    redisClient = redis.createClient({ url: config.REDIS_URL });
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    redisClient.on('connect', () => logger.info('Redis connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error(`Redis initialization failed: ${error.message}`);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const cacheGet = async (key) => {
  try {
    if (!redisClient) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error(`Cache get failed: ${error.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = config.REDIS_TTL) => {
  try {
    if (!redisClient) return;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error(`Cache set failed: ${error.message}`);
  }
};

export const cacheDelete = async (key) => {
  try {
    if (!redisClient) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Cache delete failed: ${error.message}`);
  }
};

export const cacheClear = async () => {
  try {
    if (!redisClient) return;
    await redisClient.flushDb();
  } catch (error) {
    logger.error(`Cache clear failed: ${error.message}`);
  }
};

export default { initializeRedis, getRedisClient, cacheGet, cacheSet, cacheDelete, cacheClear };
