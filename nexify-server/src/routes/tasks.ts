import express, { Router } from 'express';
import { TaskModel } from '../models/task';
import { body, validationResult } from 'express-validator';
import logger from '../logger';

const router: Router = express.Router();

router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = '1', limit = '5', filter = '', sort = 'asc' } = req.query;
    const query = filter ? { title: { $regex: filter as string, $options: 'i' }, team: teamId } : { team: teamId };

    const tasks = await TaskModel.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await TaskModel.countDocuments(query);

    logger.info('Fetched tasks', { teamId, page, limit, filter, sort, total });
    res.json({
      data: {
        data: tasks,
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch tasks', { error });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

interface TaskRequestBody {
  title: string;
  assignedTo?: string[];
  status?: 'todo' | 'in-progress' | 'done';
}

interface TaskResponse {
  data: typeof TaskModel.prototype;
}

router.post(
  '/:teamId',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('assignedTo').optional().isArray().withMessage('AssignedTo must be an array'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  ],
  async (req: express.Request<{ teamId: string }, any, TaskRequestBody>, res: express.Response<TaskResponse | { errors: any[] } | { error: string }>) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { teamId } = req.params;
      const { title, assignedTo, status } = req.body;
      const task = new TaskModel({ title, assignedTo, status, team: teamId });
      await task.save();
      logger.info('Created task', { taskId: task._id, teamId });
      res.status(201).json({ data: task });
    } catch (error) {
      logger.error('Failed to create task', { error });
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

interface TaskUpdateBody {
  status: 'todo' | 'in-progress' | 'done';
}

interface TaskUpdateResponse {
  data: typeof TaskModel.prototype;
}

router.put(
  '/:taskId',
  [
    body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  ],
  async (req: express.Request<{ taskId: string }, any, TaskUpdateBody>, res: express.Response<TaskUpdateResponse | { errors: any[] } | { error: string }>) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { taskId } = req.params;
      const { status } = req.body;
      const task = await TaskModel.findByIdAndUpdate(taskId, { status }, { new: true });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      logger.info('Updated task', { taskId });
      res.json({ data: task });
    } catch (error) {
      logger.error('Failed to update task', { error });
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
);

export default router;