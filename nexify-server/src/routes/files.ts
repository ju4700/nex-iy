import express, { Router, Request, Response } from 'express';
import { FileModel } from '../models/file';
import { body, validationResult } from 'express-validator';
import logger from '../logger';
import { v4 as uuidv4 } from 'uuid';
const multer = require('multer');
import path from 'path';


interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

type FileCallback = (error: Error | null, filename: string) => void;

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req: Request, file: any, cb: FileCallback) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post(
  '/:teamId',
  upload.single('file'),
  [
    body('teamId').notEmpty().withMessage('Team ID is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { teamId } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const uploadedFile = (req as any).file;
      if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = new FileModel({
        name: uploadedFile.originalname,
        url: `/uploads/${uploadedFile.filename}`,
        uploadedBy: userId,
        team: teamId,
      });
      await file.save();
      logger.info('File uploaded', { fileId: file._id, teamId });
      res.status(201).json({ data: file });
    } catch (error) {
      logger.error('Failed to upload file', { error });
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

router.get('/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const files = await FileModel.find({ team: teamId }).sort({ createdAt: -1 });
    logger.info('Fetched files', { teamId, count: files.length });
    res.json({ data: files });
  } catch (error) {
    logger.error('Failed to fetch files', { error });
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

export default router;