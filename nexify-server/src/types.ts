import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface User {
  username: string;
  email: string;
  password: string;
  teams?: string[];
  createdAt?: Date;
  isVerified?: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}
  
  export interface Team {
    _id: string;
    name: string;
    owner: string; 
    members: string[]; 
    createdAt: Date;
  }
  
  export interface Message {
    _id: string;
    text: string;
    user: string; 
    team: string;
    createdAt: Date;
  }
  
  export interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    assignedTo: string[];
    team: string;
    createdAt: Date;
  }
  
  export interface File {
    _id: string;
    name: string;
    url: string;
    uploadedBy: string; 
    team: string;
    createdAt: Date;
  }