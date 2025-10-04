import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

// Create a mock client for build time when environment variables are missing
const createMockAdminClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null })
  }),
  rpc: () => Promise.resolve({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
      remove: () => Promise.resolve({ data: null, error: null })
    })
  }
})

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase admin environment variables not found, using mock client')
    return createMockAdminClient() as any
  }
  
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return supabaseAdminInstance
}

// For backward compatibility
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>]
  }
})