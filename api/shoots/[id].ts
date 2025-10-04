
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';
import { insertShootSchema } from '../../shared/schema';
import { z } from 'zod';
import { getUserIdFromRequest } from '../../lib/auth';

// Helper to get user's active team ID (copied from Express logic)
async function getUserTeamId(userId: string): Promise<string | null> {
  const profile = await storage.getUserProfile(userId);
  if (profile?.activeTeamId) {
    const activeMembership = await storage.getTeamMember(profile.activeTeamId, userId);
    if (activeMembership) {
      return profile.activeTeamId;
    }
  }
  const member = await storage.getUserTeamMember(userId);
  if (member) {
    await storage.setActiveTeam(userId, member.teamId);
    return member.teamId;
  }
  const teamName = profile?.firstName ? `${profile.firstName}'s Team` : 'My Team';
  const team = await storage.createTeam({ name: teamName });
  await storage.createTeamMember({ teamId: team.id, userId, role: 'owner' });
  await storage.setActiveTeam(userId, team.id);
  return team.id;
}

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
    const shootId = req.query.id as string;
    if (!shootId) {
      res.status(400).json({ error: 'Shoot ID is required' });
      return;
    }

    if (req.method === 'GET') {
      const shoot = await storage.getTeamShoot(shootId, teamId);
      if (!shoot) {
        res.status(404).json({ error: 'Shoot not found' });
        return;
      }
      res.status(200).json(shoot);
    } else if (req.method === 'PATCH') {
      const updateSchema = insertShootSchema.omit({ userId: true, teamId: true }).partial();
      const data = updateSchema.parse(req.body);
      const updatedShoot = await storage.updateTeamShoot(shootId, teamId, data);
      if (!updatedShoot) {
        res.status(404).json({ error: 'Shoot not found' });
        return;
      }
      res.status(200).json(updatedShoot);
    } else if (req.method === 'DELETE') {
      const deleted = await storage.deleteTeamShoot(shootId, teamId);
      if (!deleted) {
        res.status(404).json({ error: 'Shoot not found' });
        return;
      }
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
      res.status(500).json({ error: errMsg });
    }
  }
}
