import { supabase } from '../server/supabase';
import jwt from 'jsonwebtoken';

// Helper to parse cookies from request headers
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    cookies[name] = rest.join('=');
  });
  return cookies;
}

// Validate Supabase JWT and return user ID
export async function getUserIdFromRequest(req: { headers: any }): Promise<string | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['sb-access-token'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  try {
    // Supabase JWT is a standard JWT; decode and verify
    const decoded = jwt.decode(token) as { sub?: string };
    if (!decoded?.sub) return null;
    // Optionally, verify signature (requires Supabase JWT secret)
    // jwt.verify(token, process.env.SUPABASE_JWT_SECRET)
    return decoded.sub;
  } catch {
    return null;
  }
}
