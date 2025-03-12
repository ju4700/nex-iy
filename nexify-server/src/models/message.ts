import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../types';

interface MessageDocument extends Document, Omit<Message, '_id'> {}

const messageSchema = new Schema({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema);