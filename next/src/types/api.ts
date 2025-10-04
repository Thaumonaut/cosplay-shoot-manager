import { User, Team, Shoot } from './database'

// API request/response types
export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  error: string
}

export interface CreateTeamRequest {
  name: string
}

export interface CreateShootRequest {
  title: string
  description?: string
  date: string
  location?: string
}

// Frontend state types
export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export interface AppState {
  auth: AuthState
  currentTeam: Team | null
  shoots: Shoot[]
}