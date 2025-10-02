import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { AuthRequest } from "./auth";

export type TeamRole = "owner" | "admin" | "member";

export interface TeamAuthRequest extends AuthRequest {
  teamId?: string;
  teamRole?: TeamRole;
}

export async function getUserTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
  const member = await storage.getTeamMember(teamId, userId);
  return member?.role as TeamRole || null;
}

export function requireTeamRole(minRole: TeamRole) {
  const roleHierarchy: Record<TeamRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  return async (req: TeamAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const teamId = req.params.teamId || req.body.teamId;
      if (!teamId) {
        return res.status(400).json({ error: "Team ID required" });
      }

      const userRole = await getUserTeamRole(req.user.id, teamId);
      if (!userRole) {
        return res.status(403).json({ error: "Not a member of this team" });
      }

      if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
        return res.status(403).json({ error: `Requires ${minRole} role or higher` });
      }

      req.teamId = teamId;
      req.teamRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Permission check failed",
      });
    }
  };
}

export async function canModifyTeamMember(
  actorRole: TeamRole,
  targetRole: TeamRole
): Promise<boolean> {
  const roleHierarchy: Record<TeamRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  if (actorRole === "owner") return true;
  
  if (actorRole === "admin") {
    return targetRole === "member";
  }

  return false;
}
