
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';
import { insertShootParticipantSchema } from '../../../shared/schema';
import { z } from 'zod';
import { getUserIdFromRequest } from '../../../lib/auth';

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
      const participants = await storage.getShootParticipants(shootId);
      res.status(200).json(participants);
    } else if (req.method === 'POST') {
      try {
        const data = insertShootParticipantSchema.parse({ ...req.body, shootId });
        const participant = await storage.createShootParticipant(data);
        res.status(201).json(participant);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ error: error.errors });
        } else {
          res.status(500).json({ error: error.message || 'Failed to add participant' });
        }
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
