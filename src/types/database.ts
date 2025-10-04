// Database schema types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface Shoot {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  status: 'planning' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  team_id: string
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  shoot_id: string
  name: string
  role: string
  contact_info?: string
  notes?: string
  created_at: string
}

export interface Reference {
  id: string
  shoot_id: string
  title: string
  image_url?: string
  description?: string
  created_at: string
}