import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { storage } from './storage'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email?: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  return payload?.userId || null
}

export function createAuthResponse(data: any, token?: string) {
  const response = { ...data }
  if (token) {
    response.token = token
  }
  return response
}

// Helper to get user's active team ID (migrated from Express logic)
export async function getUserTeamId(userId: string): Promise<string | null> {
  const profile = await storage.getUserProfile(userId)
  if (profile?.activeTeamId) {
    const activeMembership = await storage.getTeamMember(profile.activeTeamId, userId)
    if (activeMembership) {
      return profile.activeTeamId
    }
  }
  const member = await storage.getUserTeamMember(userId)
  if (member) {
    await storage.setActiveTeam(userId, member.teamId)
    return member.teamId
  }
  const teamName = profile?.firstName ? `${profile.firstName}'s Team` : 'My Team'
  const team = await storage.createTeam({ name: teamName })
  await storage.createTeamMember({ teamId: team.id, userId, role: 'owner' })
  await storage.setActiveTeam(userId, team.id)
  return team.id
}