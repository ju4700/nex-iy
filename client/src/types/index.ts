export interface Message {
  user: string;
  text: string;
  timestamp: string;
}

export interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
}