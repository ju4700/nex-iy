import express, { Router } from 'express';
import { TeamModel, UserModel } from '../models';
import { body, validationResult } from 'express-validator';
import logger from '../logger';

const router: Router = express.Router();

router.post(
  '/create',
  [
    body('name').trim().notEmpty().withMessage('Team name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const userId = req.user?.id; // Assuming middleware sets req.user from JWT
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const team = new TeamModel({ name, owner: userId, members: [userId] });
      await team.save();

      await UserModel.findByIdAndUpdate(userId, { $push: { teams: team._id } });
      logger.info('Team created', { teamId: team._id, owner: userId });
      res.status(201).json({ team });
    } catch (error) {
      logger.error('Team creation failed', { error });
      res.status(500).json({ error: 'Team creation failed' });
    }
  }
);

router.post(
  '/invite',
  [
    body('teamId').notEmpty().withMessage('Team ID is required'),
    body('memberEmail').isEmail().withMessage('Invalid email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { teamId, memberEmail } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const team = await TeamModel.findById(teamId);
      if (!team || team.owner.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized to invite members' });
      }

      const member = await UserModel.findOne({ email: memberEmail });
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      if (team.members.includes(member._id)) {
        return res.status(400).json({ error: 'Member already in team' });
      }

      team.members.push(member._id);
      await team.save();
      await UserModel.findByIdAndUpdate(member._id, { $push: { teams: team._id } });
      logger.info('Member invited', { teamId, memberId: member._id });
      res.json({ team });
    } catch (error) {
      logger.error('Invite failed', { error });
      res.status(500).json({ error: 'Invite failed' });
    }
  }
);

export default router;