import express from 'express';
import { Report } from '../models/Report';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name email')
      .sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { goals, roadblocks } = req.body;
  try {
    const report = new Report({ userId: req.user?.id, goals, roadblocks });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;