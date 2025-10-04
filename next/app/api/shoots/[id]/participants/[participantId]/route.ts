import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function GET(req: NextRequest, { params }: { params: { id: string, participantId: string } }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    // Verify shoot belongs to team
    const shoot = await storage.getTeamShoot(params.id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const participant = await storage.getShootParticipantById(params.participantId)
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }
    return NextResponse.json(participant)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, participantId: string } }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    // Verify shoot belongs to team
    const shoot = await storage.getTeamShoot(params.id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const updates = await req.json()
    const updatedParticipant = await storage.updateShootParticipant(params.participantId, updates)
    if (!updatedParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }
    return NextResponse.json(updatedParticipant)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, participantId: string } }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    // Verify shoot belongs to team
    const shoot = await storage.getTeamShoot(params.id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const deleted = await storage.deleteShootParticipant(params.participantId)
    if (!deleted) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Participant deleted successfully' })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}