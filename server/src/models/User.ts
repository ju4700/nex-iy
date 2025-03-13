import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['founder', 'team_lead', 'intern', 'member'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export const User = mongoose.model('User', userSchema);