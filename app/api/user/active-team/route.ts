import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = await req.json()
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    // Verify the user is a member of this team
    const teamMember = await storage.getTeamMember(teamId, userId)
    if (!teamMember) {
      return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 })
    }

    // Set the active team
    const result = await storage.setActiveTeam(userId, teamId)
    
    return NextResponse.json({ 
      success: true, 
      activeTeamId: teamId,
      message: 'Active team updated successfully' 
    })
  } catch (error) {
    console.error('Error setting active team:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}