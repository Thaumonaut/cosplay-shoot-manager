
import { getUserIdFromRequest } from '../lib/auth';
// ...existing code...

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const teamId = await getUserTeamId(userId);
    if (!teamId) {
      res.status(400).json({ error: 'No active team found' });
      return;
    }

    if (req.method === 'GET') {
      // Get team details
      const team = await storage.getTeam(teamId);
      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.status(200).json(team);
    } else if (req.method === 'POST') {
      // Create a new team
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: 'Team name is required' });
        return;
      }
      const newTeam = await storage.createTeam({ name: name.trim() });
      await storage.createTeamMember({ teamId: newTeam.id, userId, role: 'owner' });
      await storage.setActiveTeam(userId, newTeam.id);
      res.status(201).json(newTeam);
    } else if (req.method === 'PATCH') {
      // Update team
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
      // Delete team
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
