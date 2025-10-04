
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';
import { getUserIdFromRequest } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const teamId = req.query.id as string;
    if (!teamId) {
      res.status(400).json({ error: 'Team ID is required' });
      return;
    }

    if (req.method === 'GET') {
      const team = await storage.getTeam(teamId);
      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.status(200).json(team);
    } else if (req.method === 'PATCH') {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Team name is required' });
        return;
      }
      const updatedTeam = await storage.updateTeam(teamId, { name });
      if (!updatedTeam) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.status(200).json(updatedTeam);
    } else if (req.method === 'DELETE') {
      const deleted = await storage.deleteTeam(teamId);
      if (!deleted) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.status(200).json({ message: 'Team deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
