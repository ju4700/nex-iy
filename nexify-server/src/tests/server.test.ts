import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { UserModel } from '../models/user';
import { TeamModel } from '../models/team';
import { MessageModel } from '../models/message';
import { TaskModel } from '../models/task';
import { FileModel } from '../models/file';

describe('Database Models', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/nexify-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a user', async () => {
    const user = new UserModel({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    await user.save();
    expect(user._id).toBeDefined();
    expect(user.username).toBe('testuser');
  });

  it('should create a team', async () => {
    const user = await UserModel.findOne({ username: 'testuser' });
    const team = new TeamModel({ name: 'Test Team', owner: user!._id, members: [user!._id] });
    await team.save();
    expect(team._id).toBeDefined();
    expect(team.name).toBe('Test Team');
  });

  it('should create a message', async () => {
    const user = await UserModel.findOne({ username: 'testuser' });
    const team = await TeamModel.findOne();
    const message = new MessageModel({
      text: 'Test message',
      user: user!._id,
      team: team!._id,
    });
    await message.save();
    expect(message._id).toBeDefined();
    expect(message.text).toBe('Test message');
  });

  it('should create a task', async () => {
    const user = await UserModel.findOne({ username: 'testuser' });
    const team = await TeamModel.findOne();
    const task = new TaskModel({
      title: 'Test task',
      assignedTo: [user!._id],
      team: team!._id,
    });
    await task.save();
    expect(task._id).toBeDefined();
    expect(task.title).toBe('Test task');
  });

  it('should create a file', async () => {
    const user = await UserModel.findOne({ username: 'testuser' });
    const team = await TeamModel.findOne();
    const file = new FileModel({
      name: 'testfile.txt',
      url: '/uploads/testfile.txt',
      uploadedBy: user!._id,
      team: team!._id,
    });
    await file.save();
    expect(file._id).toBeDefined();
    expect(file.name).toBe('testfile.txt');
  });
});