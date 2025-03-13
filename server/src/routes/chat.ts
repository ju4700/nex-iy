import { Router } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const messageSchema = new mongoose.Schema({
  roomId: String,
  message: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  threadId: { type: String, default: null },
});

const Message = mongoose.model('Message', messageSchema);

router.get('/:roomId', authMiddleware, async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId }).populate('userId', 'name');
  res.json(messages);
});

router.post('/channel', authMiddleware, async (req, res) => {
  const { name } = req.body;
  res.json({ roomId: name.toLowerCase().replace(/\s/g, '-'), name });
});

export default router;