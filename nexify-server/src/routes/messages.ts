import express, { Router } from 'express';
import { MessageModel } from '../models/message';
import logger from '../logger';

const router: Router = express.Router();

router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await MessageModel.find({ team: teamId }).sort({ createdAt: -1 }).limit(50);
    logger.info('Fetched messages', { teamId, count: messages.length });
    res.json({ data: messages });
  } catch (error) {
    logger.error('Failed to fetch messages', { error });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;