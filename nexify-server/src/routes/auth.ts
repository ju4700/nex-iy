import express, { Router } from 'express';
import { UserModel } from '../models/user';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import logger from '../logger';
import { Request, Response } from 'express';

const router: Router = express.Router();

interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
}

interface JwtPayload {
  id: string;
}

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request<{}, {}, RegistrationRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserModel({ username, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ id: user._id } as JwtPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      logger.info('User registered', { userId: user._id });
      
      const userResponse: UserResponse = {
        id: user._id.toString(),
        username,
        email
      };
      
      res.status(201).json({ token, user: userResponse });
    } catch (error) {
      logger.error('Registration failed', { error });
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

interface LoginRequest {
  email: string;
  password: string;
}

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id } as JwtPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      logger.info('User logged in', { userId: user._id });
      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      logger.error('Login failed', { error });
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;