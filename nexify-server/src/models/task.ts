import mongoose, { Schema, Document } from 'mongoose';
import { Task as ITask } from '../types';

interface TaskDocument extends Document, Omit<ITask, '_id'> {}

const taskSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema);