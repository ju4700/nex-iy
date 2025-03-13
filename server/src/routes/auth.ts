import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Workspace from '../models/Workspace';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';


const router = express.Router();

router.post('/register', (async (req, res) => {
  const { email, password, name, role, workspaceName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword, name, role, workspaces: [] });
    await user.save();

    const workspace = new Workspace({
      name: workspaceName,
      owner: user._id,
      members: [user._id],
      inviteCode: uuidv4(),
    });
    await workspace.save();

    user.workspaces.push(workspace._id);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role, team: user.team, workspaces: user.workspaces },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
}) as RequestHandler);

router.post('/login', (async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('workspaces', 'name');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, team: user.team, workspaces: user.workspaces },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
}) as RequestHandler);

router.post('/join-workspace', (async (req, res) => {
  const { inviteCode } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    const workspace = await Workspace.findOne({ inviteCode });

    if (!user || !workspace) return res.status(404).json({ message: 'User or Workspace not found' });
    if (user.workspaces.includes(workspace._id)) return res.status(400).json({ message: 'Already in workspace' });

    user.workspaces.push(workspace._id);
    workspace.members.push(user._id);
    await user.save();
    await workspace.save();

    res.json({
      user: { id: user._id, name: user.name, role: user.role, team: user.team, workspaces: user.workspaces },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
}) as RequestHandler);

router.get('/me', authMiddleware, (async (req, res) => {
  try {
    const user = await User.findById((req as any).userId).populate('workspaces', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      workspaces: user.workspaces,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
}) as RequestHandler);

export default router;