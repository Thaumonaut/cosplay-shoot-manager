

import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';
import { insertShootSchema } from '../shared/schema';
import { z } from 'zod';
import { getUserIdFromRequest } from '../lib/auth';

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

    if (req.method === 'GET') {
      const shoots = await storage.getTeamShoots(teamId);
      res.status(200).json(shoots);
    } else if (req.method === 'POST') {
      const shootData = req.body;
      // Accept either camelCase or snake_case from clients by normalizing keys.
      const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      const convertKeysToCamel = (obj: any): any => {
        if (obj == null) return obj;
        if (Array.isArray(obj)) return obj.map(convertKeysToCamel);
        if (typeof obj === 'object') {
          const out: any = {};
          for (const key of Object.keys(obj)) {
            out[toCamel(key)] = convertKeysToCamel(obj[key]);
          }
          return out;
        }
        return obj;
      };
      const normalizedData = convertKeysToCamel(shootData);
      if (normalizedData.instagramLinks && typeof normalizedData.instagramLinks === 'string') {
        try {
          normalizedData.instagramLinks = JSON.parse(normalizedData.instagramLinks);
        } catch (e) {
          normalizedData.instagramLinks = [];
        }
      }
      const data = insertShootSchema.parse({ ...normalizedData, userId, teamId });
      const createdShoot = await storage.createShoot(data);
      res.status(201).json(createdShoot);
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
