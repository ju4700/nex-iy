import mongoose, { Schema, Document } from 'mongoose';
import { Team } from '../types';

const teamSchema = new Schema<Team & Document>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export const TeamModel = mongoose.model<Team & Document>('Team', teamSchema);