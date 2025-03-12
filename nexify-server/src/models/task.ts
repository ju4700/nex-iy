import mongoose, { Schema } from 'mongoose';
import { Task } from '../types';

const taskSchema = new Schema<Task>({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const TaskModel = mongoose.model<Task>('Task', taskSchema);