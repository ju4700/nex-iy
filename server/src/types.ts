export interface Message {
    _id: string;
    text: string;
    user: string;
    createdAt: string;
  }
  
  export interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    createdAt: string;
  }