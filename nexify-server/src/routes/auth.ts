import express, { Router } from 'express';
import { UserModel } from '../models/user';
import { Document } from 'mongoose';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../logger';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// Define interfaces
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
}

interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password }: RegisterRequest = req.body;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);
      const verificationToken: string = uuidv4();
      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationToken,
      });
      await user.save();

      await sendVerificationEmail(email, verificationToken);
      const token: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      const refreshToken: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      
      const response: RegisterResponse = {
        token,
        refreshToken,
        user: { id: (user as Document).id, username, email, isVerified: user.isVerified ?? false }
      };
      return res.status(201).json(response);
    } catch (error) {
      logger.error('Registration failed', { error });
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Define interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password }: LoginRequest = req.body;
      const user = (await UserModel.findOne({ email }).exec()) as { _id: string; username: string; email: string; password: string; isVerified: boolean; };
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ error: 'Email not verified' });
      }

      const token: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      const refreshToken: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      
      logger.info('User logged in', { userId: user._id });
      const response: LoginResponse = {
        token,
        refreshToken,
        user: { id: user._id.toString(), username: user.username, email: user.email, isVerified: user.isVerified }
      };
      return res.json(response);
    } catch (error) {
      logger.error('Login failed', { error });
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as { id: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    logger.info('Token refreshed', { userId: user._id });
    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await UserModel.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    logger.info('Email verified', { userId: user._id });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification failed', { error });
    res.status(500).json({ error: 'Email verification failed' });
  }
});

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

router.post('/forgot-password', 
  [body('email').isEmail().withMessage('Invalid email')], 
  async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email }: ForgotPasswordRequest = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken: string = uuidv4();
      const resetTokenExpiry: number = Date.now() + 3600000; // 1 hour expiry
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      await sendResetPasswordEmail(email, resetToken);
      logger.info('Password reset email sent', { email });
      const response: ForgotPasswordResponse = { message: 'Password reset email sent' };
      return res.json(response);
    } catch (error) {
      logger.error('Forgot password failed', { error });
      return res.status(500).json({ error: 'Failed to send reset email' });
    }
  }
);

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;
      const user = await UserModel.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      logger.info('Password reset successful', { userId: user._id });
      const response: ResetPasswordResponse = { message: 'Password reset successful' };
      return res.json(response);
    } catch (error) {
      logger.error('Password reset failed', { error });
      return res.status(500).json({ error: 'Password reset failed' });
    }
  }
);

export default router;