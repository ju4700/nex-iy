import express from 'express';
import { Message } from '../models/Message';

const router = express.Router();

router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('userId', 'name')
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { roomId, message } = req.body;
  try {
    const newMessage = new Message({ roomId, message, userId: req.user?.id });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;