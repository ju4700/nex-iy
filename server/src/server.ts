import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import messageRoutes from './routes/message';
import taskRoutes from './routes/tasks';
import logger from './logger';
import { Task } from './types';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
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

app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexiy')
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', { error: err }));

const connectedUsers: string[] = [];

io.on('connection', (socket: Socket) => {
  logger.info('User connected', { socketId: socket.id });

  socket.on('send-message', async (message: { text: string; user: string }) => {
    try {
      const newMessage = new (mongoose.model('Message'))({
        text: message.text,
        user: message.user,
        createdAt: new Date(),
      });
      await newMessage.save();
      io.emit('new-message', newMessage);
      logger.info('New message sent', { messageId: newMessage._id });
    } catch (error) {
      logger.error('Error sending message', { error });
    }
  });

  socket.on('task-update', async (task: Task) => {
    try {
      const updatedTask = await mongoose.model('Task').findByIdAndUpdate(
        task._id,
        { status: task.status },
        { new: true }
      );
      io.emit('task-update', updatedTask);
      logger.info('Task updated', { taskId: task._id });
    } catch (error) {
      logger.error('Error updating task', { error });
    }
  });

  socket.on('join-video-call', () => {
    connectedUsers.push(socket.id);
    socket.broadcast.emit('user-joined', socket.id);
    socket.emit('user-already-connected', connectedUsers.filter((id) => id !== socket.id));
    logger.info('User joined video call', { socketId: socket.id });
  });

  socket.on('leave-video-call', () => {
    connectedUsers.splice(connectedUsers.indexOf(socket.id), 1);
    socket.broadcast.emit('user-left', socket.id);
    logger.info('User left video call', { socketId: socket.id });
  });

  socket.on('signal', (data: { target: string; from: string; signal: any }) => {
    io.to(data.target).emit('signal', { from: data.from, signal: data.signal });
  });

  socket.on('disconnect', () => {
    connectedUsers.splice(connectedUsers.indexOf(socket.id), 1);
    socket.broadcast.emit('user-left', socket.id);
    logger.info('User disconnected', { socketId: socket.id });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});