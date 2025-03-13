import express from 'express';
import { Task } from '../models/Task';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo createdBy', 'name email')
      .populate('comments.userId', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  try {
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user?.id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.post('/:id/comments', async (req, res) => {
  const { text } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments.push({ userId: req.user?.id, text });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;