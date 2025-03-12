import { createClient } from 'redis';
import { config } from '../config';
import logger from '../logger';

const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));
redisClient.on('connect', () => logger.info('Connected to Redis'));

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;