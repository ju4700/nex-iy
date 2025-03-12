export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  export interface Team {
    _id: string;
    name: string;
    owner: string;
    members: string[];
  }
  
  export interface Message {
    _id: string;
    text: string;
    user: string;
    team: string;
    createdAt: string;
  }
  
  export interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    assignedTo: string[];
    team: string;
    createdAt: string;
  }
  
  export interface File {
    _id: string;
    name: string;
    url: string;
    uploadedBy: string;
    team: string;
    createdAt: string;
  }