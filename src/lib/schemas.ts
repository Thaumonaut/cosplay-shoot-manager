import { z } from 'zod'

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1).optional(),
})

export const authRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100)
})

export const createShootSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional()
})