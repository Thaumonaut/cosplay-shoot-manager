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
    const shoot = await storage.getTeamShoot(id, teamId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }
    return NextResponse.json(shoot)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const updates = await req.json()
    const { id } = await params
    const updatedShoot = await storage.updateTeamShoot(id, teamId, updates)
    if (!updatedShoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }
    return NextResponse.json(updatedShoot)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const deleted = await storage.deleteTeamShoot(id, teamId)
    if (!deleted) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Shoot deleted successfully' })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}