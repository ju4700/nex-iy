import mongoose, { Schema, Document } from 'mongoose';
import { Team } from '../types';

interface TeamDocument extends Document, Omit<Team, '_id'> {}

const teamSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export const TeamModel = mongoose.model<TeamDocument>('Team', teamSchema);