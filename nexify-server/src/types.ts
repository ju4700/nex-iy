export interface User {
    _id: string;
    username: string;
    email: string;
    password: string; // Will be hashed
    teams: string[]; // Array of team IDs
    createdAt: Date;
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