import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis'; 
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import taskRoutes from './routes/tasks';
import reportRoutes from './routes/reports';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(helmet());
app.use(express.json());

// Redis client for v4
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().catch(err => console.error('Redis connection error:', err));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string, { dbName: 'startup_platform' })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// Socket.io for real-time interactions
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, message, userId }) => {
    const newMessage = { roomId, message, userId, timestamp: new Date() };
    await mongoose.model('Message').create(newMessage);
    io.to(roomId).emit('message', newMessage);
  });

  socket.on('taskUpdate', async ({ taskId, status }) => {
    const task = await mongoose.model('Task').findByIdAndUpdate(taskId, { status }, { new: true });
    io.emit('taskUpdated', task);
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));