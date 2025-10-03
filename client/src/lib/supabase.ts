import { createClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// If the dev supabase URL points to localhost without an explicit port, some
// environments (and older supabase client behavior) can end up constructing
// an invalid websocket URL like ws://localhost:undefined. Provide a reasonable
// default port for local supabase (54321) when none is present.
try {
  const urlObj = new URL(supabaseUrl);
  if (urlObj.hostname === 'localhost' && !/:\d+$/.test(supabaseUrl)) {
    // append default supabase local port
    supabaseUrl = supabaseUrl.replace(/\/+$/, '') + ':54321';
  }
} catch (e) {
  // If URL parsing fails, leave original value — createClient will throw later
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: true,
  },
});
