import mongoose, { Schema, Document } from 'mongoose';
import { File as IFile } from '../types';

interface FileDocument extends Document, Omit<IFile, '_id'> {}

const fileSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FileModel = mongoose.model<FileDocument>('File', fileSchema);