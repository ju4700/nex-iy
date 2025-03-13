import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['founder', 'team_lead', 'intern', 'member'], default: 'member' },
  team: { type: String, required: true },
  lastLogin: { type: Date },
});

export default mongoose.model('User', userSchema);