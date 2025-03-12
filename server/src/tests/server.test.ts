import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MessageModel } from '../models/message';
import { TaskModel } from '../models/task';

describe('Database Models', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/nexiy-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a message', async () => {
    const message = new MessageModel({
      text: 'Test message',
      user: 'Test user',
      createdAt: new Date(),
    });
    await message.save();
    expect(message._id).toBeDefined();
    expect(message.text).toBe('Test message');
  });

  it('should create a task', async () => {
    const task = new TaskModel({
      title: 'Test task',
      status: 'todo',
      createdAt: new Date(),
    });
    await task.save();
    expect(task._id).toBeDefined();
    expect(task.title).toBe('Test task');
  });
});