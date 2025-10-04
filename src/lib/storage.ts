import { supabaseAdmin } from './supabase-admin'

// Helper functions for case conversion
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (typeof obj !== 'object') return obj

  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = toCamelCase(obj[key])
    }
  }
  return result
}

function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (typeof obj !== 'object') return obj

  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      result[snakeKey] = toSnakeCase(obj[key])
    }
  }
  return result
}

export class Storage {
  // Mock data for development testing
  private getMockUserProfile() {
    return {
      userId: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      activeTeamId: 'test-team-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private getMockTeam() {
    return {
      id: 'test-team-123',
      name: 'Test Team',
      description: 'Development test team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private getMockTeamMember() {
    return {
      id: 'test-member-123',
      teamId: 'test-team-123',
      userId: 'test-user-123',
      role: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<any | undefined> {
    // Return mock profile for test user
    if (userId === 'test-user-123') {
      return this.getMockUserProfile()
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select()
      .eq('user_id', userId)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createUserProfile(profile: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert(toSnakeCase(profile))
      .select()
      .single()

    if (error) throw new Error(`Failed to create user profile: ${error.message}`)
    return toCamelCase(data)
  }

  async updateUserProfile(userId: string, profile: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('user_profiles')
      .update(toSnakeCase({ ...profile, updated_at: new Date().toISOString() }))
      .eq('user_id', userId)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  // Team methods
  async getTeam(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createTeam(team: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('teams')
      .insert(toSnakeCase(team))
      .select()
      .single()

    if (error) throw new Error(`Failed to create team: ${error.message}`)
    return toCamelCase(data)
  }

  async updateTeam(id: string, team: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('teams')
      .update(toSnakeCase({ ...team, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id)

    return !error
  }

  // Team Member methods
  async getTeamMember(teamId: string, userId: string): Promise<any | undefined> {
    // Return mock team member for test user
    if (userId === 'test-user-123' && teamId === 'test-team-123') {
      return this.getMockTeamMember()
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select()
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async getUserTeamMember(userId: string): Promise<any | undefined> {
    // Return mock team member for test user
    if (userId === 'test-user-123') {
      return this.getMockTeamMember()
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select()
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createTeamMember(member: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('team_members')
      .insert(toSnakeCase(member))
      .select()
      .single()

    if (error) throw new Error(`Failed to create team member: ${error.message}`)
    return toCamelCase(data)
  }

  async setActiveTeam(userId: string, teamId: string): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .rpc('set_active_team', { p_user_id: userId, p_team_id: teamId })

    if (error) {
      console.error('Error setting active team:', error)
      return undefined
    }
    return toCamelCase(data)
  }

  // Shoot methods
  async getTeamShoots(teamId: string): Promise<any[]> {
    // Return mock shoots for test team
    if (teamId === 'test-team-123') {
      return [
        {
          id: 'test-shoot-1',
          title: 'Test Cosplay Shoot 1',
          description: 'Development test shoot',
          date: '2025-10-15',
          status: 'planned',
          teamId: 'test-team-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }

    const { data, error } = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getTeamShoot(id: string, teamId: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createShoot(shoot: any): Promise<any> {
    // Handle mock shoot creation for test team
    if (shoot.teamId === 'test-team-123') {
      const mockShoot = {
        id: `test-shoot-${Date.now()}`,
        ...shoot,
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return mockShoot
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('shoots')
      .insert(toSnakeCase(shoot))
      .select()
      .single()

    if (error) throw new Error(`Failed to create shoot: ${error.message}`)
    return toCamelCase(data)
  }

  async updateTeamShoot(id: string, teamId: string, shoot: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('shoots')
      .update(toSnakeCase({ ...shoot, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteTeamShoot(id: string, teamId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('shoots')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId)

    return !error
  }

  // Shoot References
  async getShootReferences(shootId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .select()
      .eq('shoot_id', shootId)

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getShootReferenceById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createShootReference(reference: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('shoot_references')
      .insert(toSnakeCase(reference))
      .select()
      .single()

    if (error) throw new Error(`Failed to create shoot reference: ${error.message}`)
    return toCamelCase(data)
  }

  async updateShootReference(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('shoot_references')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteShootReference(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('shoot_references')
      .delete()
      .eq('id', id)

    return !error
  }

  // Shoot Participants
  async getShootParticipants(shootId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('shoot_participants')
      .select()
      .eq('shoot_id', shootId)

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getShootParticipantById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('shoot_participants')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createShootParticipant(participant: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('shoot_participants')
      .insert(toSnakeCase(participant))
      .select()
      .single()

    if (error) throw new Error(`Failed to create shoot participant: ${error.message}`)
    return toCamelCase(data)
  }

  async updateShootParticipant(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('shoot_participants')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteShootParticipant(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('shoot_participants')
      .delete()
      .eq('id', id)

    return !error
  }

  // Equipment methods
  async getTeamEquipment(teamId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getEquipmentById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createEquipment(equipment: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('equipment')
      .insert(toSnakeCase(equipment))
      .select()
      .single()

    if (error) throw new Error(`Failed to create equipment: ${error.message}`)
    return toCamelCase(data)
  }

  async updateEquipment(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('equipment')
      .update(toSnakeCase({ ...updates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('equipment')
      .delete()
      .eq('id', id)

    return !error
  }

  // Personnel methods
  async getTeamPersonnel(teamId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getPersonnelById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createPersonnel(personnel: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('personnel')
      .insert(toSnakeCase(personnel))
      .select()
      .single()

    if (error) throw new Error(`Failed to create personnel: ${error.message}`)
    return toCamelCase(data)
  }

  async updatePersonnel(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('personnel')
      .update(toSnakeCase({ ...updates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deletePersonnel(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('personnel')
      .delete()
      .eq('id', id)

    return !error
  }

  // Costumes methods
  async getTeamCostumes(teamId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('costumes')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getCostumeById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('costumes')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createCostume(costume: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('costumes')
      .insert(toSnakeCase(costume))
      .select()
      .single()

    if (error) throw new Error(`Failed to create costume: ${error.message}`)
    return toCamelCase(data)
  }

  async updateCostume(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('costumes')
      .update(toSnakeCase({ ...updates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deleteCostume(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('costumes')
      .delete()
      .eq('id', id)

    return !error
  }

  // Places/Locations methods
  async getTeamPlaces(teamId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('places')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data || []).map(toCamelCase)
  }

  async getPlaceById(id: string): Promise<any | undefined> {
    const { data, error } = await supabaseAdmin
      .from('places')
      .select()
      .eq('id', id)
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async createPlace(place: any): Promise<any> {
    const { data, error } = await (supabaseAdmin as any)
      .from('places')
      .insert(toSnakeCase(place))
      .select()
      .single()

    if (error) throw new Error(`Failed to create place: ${error.message}`)
    return toCamelCase(data)
  }

  async updatePlace(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabaseAdmin as any)
      .from('places')
      .update(toSnakeCase({ ...updates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single()

    if (error) return undefined
    return toCamelCase(data)
  }

  async deletePlace(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('places')
      .delete()
      .eq('id', id)

    return !error
  }
}

export const storage = new Storage()