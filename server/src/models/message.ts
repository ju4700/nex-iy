import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../types';

const messageSchema = new Schema<Message & Document>({
  text: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MessageModel = mongoose.model<Message & Document>('Message', messageSchema);