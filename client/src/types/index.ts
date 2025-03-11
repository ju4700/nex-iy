export interface Message {
    _id: string;
    content: string;
    timestamp: Date;
  }
  
  export interface Task {
    _id: string;
    title: string;
    boardId?: string;
    createdAt: Date;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
  }