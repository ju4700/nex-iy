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
    owner: string; // User ID
    members: string[]; // Array of User IDs
    createdAt: Date;
  }
  
  export interface Message {
    _id: string;
    text: string;
    user: string; // User ID
    team: string; // Team ID
    createdAt: Date;
  }
  
  export interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    assignedTo: string[]; // Array of User IDs
    team: string; // Team ID
    createdAt: Date;
  }
  
  export interface File {
    _id: string;
    name: string;
    url: string;
    uploadedBy: string; // User ID
    team: string; // Team ID
    createdAt: Date;
  }