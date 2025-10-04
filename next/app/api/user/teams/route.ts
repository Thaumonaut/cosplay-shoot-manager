import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { storage } from '@/lib/storage'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all team memberships for the user with team details
    const { data: teamMemberships, error } = await supabaseAdmin
      .from('team_members')
      .select(`
        role,
        created_at,
        teams:team_id (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching team memberships:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }
    
    // Get user profile to check active team
    const profile = await storage.getUserProfile(userId)
    const activeTeamId = profile?.activeTeamId

    // Format teams for the dropdown
    const teams = (teamMemberships || []).map((membership: any) => ({
      id: membership.teams.id,
      name: membership.teams.name,
      role: membership.role,
      createdAt: membership.teams.created_at,
      isActive: membership.teams.id === activeTeamId
    }))

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching user teams:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}