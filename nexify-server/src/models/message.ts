import express, { Router } from 'express';
import MessageModel from '../models/message';
import { authenticateToken } from '../server'; 
import logger from '../logger';
import redis from '../utils/redis';

const router: Router = express.Router();

router.get('/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const cacheKey = `messages:${teamId}`;
    const cachedMessages = await redis.get(cacheKey);

    if (cachedMessages) {
      logger.info('Messages fetched from cache', { teamId });
      return res.json({ data: JSON.parse(cachedMessages) });
    }

    const messages = await MessageModel.find({ team: teamId }).sort({ createdAt: -1 }).limit(50);
    await redis.setex(cacheKey, 3600, JSON.stringify(messages)); // Cache for 1 hour
    logger.info('Messages fetched from DB', { teamId, count: messages.length });
    res.json({ data: messages });
  } catch (error) {
    logger.error('Failed to fetch messages', { error });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;