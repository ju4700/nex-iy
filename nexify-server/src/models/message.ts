import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../types';

const messageSchema = new Schema<Message & Document>({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MessageModel = mongoose.model<Message & Document>('Message', messageSchema);