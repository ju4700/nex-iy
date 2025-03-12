import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

const userSchema = new Schema<User & Document>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }, 
  resetPasswordToken: { type: String }, 
  resetPasswordExpires: { type: Date }, 
});

export const UserModel = mongoose.model<User>('User', userSchema);