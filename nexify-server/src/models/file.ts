import mongoose, { Schema, Document } from 'mongoose';
import { File } from '../types';

const fileSchema = new Schema<File & Document>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FileModel = mongoose.model<File & Document>('File', fileSchema);