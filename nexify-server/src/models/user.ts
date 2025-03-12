import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<User>('User', userSchema);