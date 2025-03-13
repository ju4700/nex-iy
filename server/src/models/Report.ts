import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goals: { type: String, required: true, trim: true },
  roadblocks: { type: String, trim: true },
  date: { type: Date, default: Date.now },
});

export const Report = mongoose.model('Report', reportSchema);