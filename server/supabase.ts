import { createClient } from "@supabase/supabase-js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const supabaseUrl = `https://${databaseUrl.hostname.split('.')[0]}.supabase.co`;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
