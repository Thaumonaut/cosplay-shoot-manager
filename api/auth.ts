import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '../server/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST' && req.url?.endsWith('/set-session')) {
      const { access_token, refresh_token, expires_at } = req.body;
      if (!access_token || !refresh_token || !expires_at) {
        res.status(400).json({ error: 'Missing session data' });
        return;
      }
      const { data: { user }, error } = await supabase.auth.getUser(access_token);
      if (error || !user) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }
      // TODO: Set cookies for session (Vercel may require custom logic)
      res.status(200).json({ user });
      return;
    }
    if (req.method === 'POST' && req.url?.endsWith('/signout')) {
      // TODO: Clear cookies for session
      res.status(200).json({ success: true });
      return;
    }
    if (req.method === 'DELETE' && req.url?.endsWith('/delete-account')) {
      // TODO: Authenticate user and delete account
      res.status(200).json({ success: true });
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
