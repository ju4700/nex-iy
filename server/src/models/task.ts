import mongoose, { Schema, Document } from 'mongoose';
import { Task } from '../types';

const taskSchema = new Schema<Task & Document>({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  createdAt: { type: Date, default: Date.now },
});

export const TaskModel = mongoose.model<Task & Document>('Task', taskSchema);