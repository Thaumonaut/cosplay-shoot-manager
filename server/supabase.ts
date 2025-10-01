import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ybnzheybytssvtmxktnq.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is required");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
