import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client for build time when environment variables are missing
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
})

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockClient() as any
  : createClient(supabaseUrl, supabaseAnonKey)