
import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';
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

    if (req.method === 'PATCH') {
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
      const body = convertKeysToCamel(req.body || {});
      const {
        equipmentIds = [],
        propIds = [],
        costumeIds = [],
        personnelIds = [],
        participants = [],
      } = body;

      // Delete existing associations
      await storage.deleteShootEquipment(shootId);
      await storage.deleteShootProps(shootId);
      await storage.deleteShootCostumes(shootId);

      // Create new equipment associations
      for (const equipmentId of equipmentIds) {
        await storage.createShootEquipment({ shootId, equipmentId, quantity: 1 });
      }
      for (const propId of propIds) {
        await storage.createShootProp({ shootId, propId });
      }
      for (const costumeId of costumeIds) {
        await storage.createShootCostume({ shootId, costumeId });
      }

      // Update participants
      await storage.deleteShootParticipants(shootId);
      for (const participant of participants) {
        await storage.createShootParticipant({
          shootId,
          personnelId: participant.personnelId || null,
          name: participant.name,
          role: participant.role,
          email: participant.email || null,
        });
      }
      // Add any newly selected personnel not already in participants
      const existingPersonnelIds = new Set(
        participants.filter((p: any) => p.personnelId).map((p: any) => p.personnelId)
      );
      for (const personnelId of personnelIds) {
        if (!existingPersonnelIds.has(personnelId)) {
          const person = await storage.getPersonnel(personnelId, teamId);
          if (person) {
            await storage.createShootParticipant({
              shootId,
              personnelId,
              name: person.name,
              role: 'Participant',
            });
          }
        }
      }
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
