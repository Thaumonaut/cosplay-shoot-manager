
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';
import { getUserIdFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const teamId = req.query.teamId as string;
    const memberId = req.query.memberId as string;
    if (!teamId || !memberId) {
      res.status(400).json({ error: 'Team ID and Member ID are required' });
      return;
    }

    if (req.method === 'DELETE') {
      // Remove team member
      const deleted = await storage.deleteTeamMember(memberId);
      if (!deleted) {
        res.status(404).json({ error: 'Team member not found' });
        return;
      }
      res.status(200).json({ message: 'Team member removed successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
