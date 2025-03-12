import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import messageRoutes from './routes/messages';
import taskRoutes from './routes/tasks';
import fileRoutes from './routes/files';
import logger from './logger';
import * as jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT'],
  },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/teams', authenticateToken, teamRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/files', authenticateToken, fileRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexify')
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', { error: err }));

const connectedUsers: Record<string, { userId: string; teamId: string }> = {};

io.on('connection', (socket: Socket) => {
  logger.info('User connected', { socketId: socket.id });

  socket.on('join-team', ({ userId, teamId, token }) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
      connectedUsers[socket.id] = { userId, teamId };
      socket.join(teamId);
      logger.info('User joined team', { socketId: socket.id, userId, teamId });
    } catch (error) {
      logger.error('Invalid token for team join', { error });
    }
  });

  socket.on('send-message', async ({ text, userId, teamId }) => {
    try {
      const newMessage = new (mongoose.model('Message'))({
        text,
        user: userId,
        team: teamId,
      });
      await newMessage.save();
      io.to(teamId).emit('new-message', newMessage);
      logger.info('New message sent', { messageId: newMessage._id, teamId });
    } catch (error) {
      logger.error('Error sending message', { error });
    }
  });

  socket.on('task-update', async ({ taskId, status, teamId }) => {
    try {
      const updatedTask = await mongoose.model('Task').findByIdAndUpdate(
        taskId,
        { status },
        { new: true }
      );
      if (updatedTask) {
        io.to(teamId).emit('task-update', updatedTask);
        logger.info('Task updated', { taskId, teamId });
      }
    } catch (error) {
      logger.error('Error updating task', { error });
    }
  });

  socket.on('join-video-call', ({ userId, teamId, token }) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
      connectedUsers[socket.id] = { userId, teamId };
      socket.join(`video-${teamId}`);
      socket.broadcast.to(`video-${teamId}`).emit('user-joined', { userId });
      logger.info('User joined video call', { socketId: socket.id, userId, teamId });
    } catch (error) {
      logger.error('Invalid token for video call', { error });
    }
  });

  socket.on('leave-video-call', ({ teamId }) => {
    const userData = connectedUsers[socket.id];
    if (userData && userData.teamId === teamId) {
      socket.broadcast.to(`video-${teamId}`).emit('user-left', { userId: userData.userId });
      delete connectedUsers[socket.id];
      logger.info('User left video call', { socketId: socket.id, teamId });
    }
  });

  socket.on('signal', ({ signal, to, teamId }) => {
    io.to(to).emit('signal', { signal, from: socket.id, teamId });
  });

  socket.on('disconnect', () => {
    const userData = connectedUsers[socket.id];
    if (userData) {
      socket.broadcast.to(`video-${userData.teamId}`).emit('user-left', { userId: userData.userId });
      delete connectedUsers[socket.id];
      logger.info('User disconnected', { socketId: socket.id });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});