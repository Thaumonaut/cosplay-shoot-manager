import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies["sb-access-token"];
    const refreshToken = req.cookies["sb-refresh-token"];
    
    if (!accessToken) {
      return res.status(401).json({ error: "Missing authentication cookie" });
    }

    // Try to validate the access token
    let { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    // If access token is invalid/expired and we have a refresh token, try to refresh
    if (error && refreshToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError || !refreshData.session) {
        return res.status(401).json({ error: "Session expired" });
      }

      // Update cookies with new tokens
      const isProduction = process.env.NODE_ENV === "production";
      const expiresIn = Math.floor((refreshData.session.expires_at! * 1000 - Date.now()) / 1000);
      
      res.cookie("sb-access-token", refreshData.session.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: expiresIn * 1000,
      });

      res.cookie("sb-refresh-token", refreshData.session.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      user = refreshData.user;
    } else if (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}
