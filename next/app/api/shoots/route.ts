import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'
import { z } from 'zod'

// Schema for shoot validation (migrated from shared/schema.ts)
const insertShootSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
  userId: z.string(),
  teamId: z.string(),
  instagramLinks: z.array(z.string()).optional()
})

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const shoots = await storage.getTeamShoots(teamId)
    return NextResponse.json(shoots)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const shootData = await req.json()
    
    // Accept either camelCase or snake_case from clients by normalizing keys.
    const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    const convertKeysToCamel = (obj: any): any => {
      if (obj == null) return obj
      if (Array.isArray(obj)) return obj.map(convertKeysToCamel)
      if (typeof obj === 'object') {
        const out: any = {}
        for (const key of Object.keys(obj)) {
          out[toCamel(key)] = convertKeysToCamel(obj[key])
        }
        return out
      }
      return obj
    }
    
    const normalizedData = convertKeysToCamel(shootData)
    if (normalizedData.instagramLinks && typeof normalizedData.instagramLinks === 'string') {
      try {
        normalizedData.instagramLinks = JSON.parse(normalizedData.instagramLinks)
      } catch (e) {
        normalizedData.instagramLinks = []
      }
    }
    
    const data = insertShootSchema.parse({ ...normalizedData, userId, teamId })
    const createdShoot = await storage.createShoot(data)
    return NextResponse.json(createdShoot, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}