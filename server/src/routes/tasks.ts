import express, { Router } from 'express';
import { TaskModel } from '../models/task';
import { body, validationResult } from 'express-validator';
import logger from '../logger';

const router: Router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '5', filter = '', sort = 'asc' } = req.query;
    const query = filter ? { title: { $regex: filter as string, $options: 'i' } } : {};

    const tasks = await TaskModel.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await TaskModel.countDocuments(query);

    logger.info('Fetched tasks', { page, limit, filter, sort, total });
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

// Define interfaces
interface CreateTaskRequest {
    title: string;
    status?: 'todo' | 'in-progress' | 'done';
}

interface ValidationErrorItem {
    msg: string;
    param: string;
    location: string;
}

router.post(
    '/',
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    ],
    async (req: express.Request<{}, {}, CreateTaskRequest>, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, status } = req.body;
            const task = new TaskModel({ title, status });
            await task.save();
            logger.info('Created task', { taskId: task._id });
            res.status(201).json({ data: task });
        } catch (error: unknown) {
            logger.error('Failed to create task', { error });
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
);

export default router;