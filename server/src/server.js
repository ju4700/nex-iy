import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import 'dotenv/config';
import logger from './logger.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

// Middleware
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  })
);
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/nexiy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

// Schemas
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now, index: true },
}, { collection: 'messages' });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  boardId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'tasks' });

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'boards' });

const Message = mongoose.model('Message', messageSchema);
const Task = mongoose.model('Task', taskSchema);
const Board = mongoose.model('Board', boardSchema);

// API Routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50).lean();
    res.json({ status: 'success', data: messages });
  } catch (err) {
    logger.error('Messages fetch error:', err.stack);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const filter = req.query.filter || '';
    const skip = (page - 1) * limit;

    const query = filter ? { title: { $regex: filter, $options: 'i' } } : {};
    const tasks = await Task.find(query).skip(skip).limit(limit).lean();
    const total = await Task.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        data: tasks,
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    logger.error('Tasks fetch error:', err.stack);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.post('/api/tasks', [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('boardId').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array() });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { title, boardId } = req.body;
    const task = new Task({ title, boardId });
    await task.save({ session });
    await session.commitTransaction();
    res.status(201).json({ status: 'success', data: task });
    logger.info(`Task created: ${task._id}`);
  } catch (err) {
    await session.abortTransaction();
    logger.error('Task create error:', err.stack);
    res.status(500).json({ status: 'error', message: 'Server error' });
  } finally {
    session.endSession();
  }
});

app.get('/api/boards', async (req, res) => {
  try {
    const boards = await Board.find().populate('tasks').lean();
    res.json({ status: 'success', data: boards });
  } catch (err) {
    logger.error('Boards fetch error:', err.stack);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.post('/api/boards', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array() });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name } = req.body;
    const board = new Board({ name });
    await board.save({ session });
    await session.commitTransaction();
    res.status(201).json({ status: 'success', data: board });
    logger.info(`Board created: ${board._id}`);
  } catch (err) {
    await session.abortTransaction();
    logger.error('Board create error:', err.stack);
    res.status(500).json({ status: 'error', message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// Socket.IO
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('message', async (content) => {
    try {
      if (!content || typeof content !== 'string') {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }
      const message = new Message({ content });
      await message.save();
      io.emit('message', message);
      logger.info(`Message sent: ${message._id}`);
    } catch (err) {
      logger.error('Message save error:', err.stack);
      socket.emit('error', { message: 'Server error saving message' });
    }
  });

  socket.on('taskUpdate', async ({ id, boardId }) => {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        socket.emit('error', { message: 'Invalid task ID' });
        return;
      }
      const task = await Task.findById(id);
      if (task) {
        task.boardId = boardId;
        await task.save();
        io.emit('taskUpdate', task);
        logger.info(`Task updated: ${task._id}`);
      }
    } catch (err) {
      logger.error('Task update error:', err.stack);
      socket.emit('error', { message: 'Server error updating task' });
    }
  });

  socket.on('signal', (data) => {
    try {
      socket.broadcast.emit('signal', data);
    } catch (err) {
      logger.error('Signal error:', err.stack);
    }
  });

  socket.on('disconnect', () => logger.info('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});