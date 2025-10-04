import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function GET(req: NextRequest, { params }: { params: { id: string, referenceId: string } }) {
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

    const reference = await storage.getShootReferenceById(params.referenceId)
    if (!reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }
    return NextResponse.json(reference)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, referenceId: string } }) {
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
    const updatedReference = await storage.updateShootReference(params.referenceId, updates)
    if (!updatedReference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }
    return NextResponse.json(updatedReference)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, referenceId: string } }) {
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

    const deleted = await storage.deleteShootReference(params.referenceId)
    if (!deleted) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Reference deleted successfully' })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}