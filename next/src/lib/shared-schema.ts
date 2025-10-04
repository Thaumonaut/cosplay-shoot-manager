// Shared schema types for the application
// This replaces the original shared/schema.ts from the Express project

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Shoot {
  id: string
  title: string
  description?: string
  date?: string
  time?: string
  durationMinutes?: number
  status: 'idea' | 'planning' | 'ready to shoot' | 'completed'
  locationNotes?: string
  calendarEventUrl?: string
  docsUrl?: string
  isPublic?: boolean
  reminderTime?: string
  participantCount?: number
  instagramLinks?: string[]
  userId: string
  teamId: string
  created_at: string
  updated_at: string
}

export interface Personnel {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  notes?: string
  teamId: string
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  name: string
  category?: string
  description?: string
  quantity?: number
  available?: boolean
  teamId: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address?: string
  placeId?: string
  latitude?: number
  longitude?: number
  notes?: string
  teamId: string
  created_at: string
  updated_at: string
}

export interface Prop {
  id: string
  name: string
  description?: string
  category?: string
  teamId: string
  created_at: string
  updated_at: string
}

export interface CostumeProgress {
  id: string
  name: string
  character?: string
  series?: string
  progress?: number
  notes?: string
  teamId: string
  created_at: string
  updated_at: string
}

// Insert types for creating new records
export type InsertShoot = Omit<Shoot, 'id' | 'created_at' | 'updated_at'>
export type InsertPersonnel = Omit<Personnel, 'id' | 'created_at' | 'updated_at'>
export type InsertEquipment = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>
export type InsertLocation = Omit<Location, 'id' | 'created_at' | 'updated_at'>
export type InsertProp = Omit<Prop, 'id' | 'created_at' | 'updated_at'>
export type InsertCostumeProgress = Omit<CostumeProgress, 'id' | 'created_at' | 'updated_at'>

// Enriched types for UI components
export interface EnrichedShoot extends Shoot {
  location?: Location
  participants?: Personnel[]
  equipment?: Equipment[]
  props?: Prop[]
  costumes?: CostumeProgress[]
}

export interface ShootEvent {
  id: string
  title: string
  date: Date
  status: 'idea' | 'planning' | 'ready to shoot' | 'completed'
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: any
}