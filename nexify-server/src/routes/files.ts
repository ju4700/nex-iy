import express, { Router } from 'express';
import { FileModel } from '../models/file';
import { body, validationResult } from 'express-validator';
import logger from '../logger';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();
// Define types
interface MulterFile {
    originalname: string;
    // Other properties omitted for brevity
}

type FileCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req: express.Request, file: MulterFile, cb: FileCallback) => {
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { teamId } = req.params;
      const userId = req.user?.id; // Assuming middleware sets req.user from JWT
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = new FileModel({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
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

router.get('/:teamId', async (req, res) => {
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