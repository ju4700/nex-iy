import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, email, role, team } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.team = team || user.team;
    await user.save();

    res.json({ id: user._id, name: user.name, role: user.role, team: user.team, workspaces: user.workspaces });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;