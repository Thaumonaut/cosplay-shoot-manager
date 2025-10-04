import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const { id } = await params
    // Verify shoot belongs to team
    const shoot = await storage.getTeamShoot(id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const references = await storage.getShootReferences(id)
    return NextResponse.json(references)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const { id } = await params
    // Verify shoot belongs to team
    const shoot = await storage.getTeamShoot(id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const referenceData = await req.json()
    const reference = await storage.createShootReference({
      ...referenceData,
      shootId: id
    })
    return NextResponse.json(reference, { status: 201 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}