import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertShootSchema,
  insertShootReferenceSchema,
  insertShootParticipantSchema,
  insertUserProfileSchema,
  insertPersonnelSchema,
  insertEquipmentSchema,
  insertLocationSchema,
  insertPropSchema,
  insertCostumeProgressSchema,
} from "@shared/schema";
import { z } from "zod";
import { authenticateUser, type AuthRequest } from "./middleware/auth";
import { createShootDocument } from "./services/docs-export";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./services/calendar";
import { sendShootReminder } from "./services/email";
import { supabase, supabaseAdmin } from "./supabase";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import multer from "multer";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const getUserId = (req: AuthRequest): string => {
    if (!req.user?.id) {
      throw new Error("Unauthorized");
    }
    return req.user.id;
  };

  const getUserTeamId = async (userId: string): Promise<string> => {
    const profile = await storage.getUserProfile(userId);
    
    // If user has an active team set, verify membership still exists
    if (profile?.activeTeamId) {
      const activeMembership = await storage.getTeamMember(profile.activeTeamId, userId);
      if (activeMembership) {
        return profile.activeTeamId;
      }
      // Active team membership no longer exists, fall through to find/create another
    }
    
    // Check if user has any team membership
    let member = await storage.getUserTeamMember(userId);
    
    // If user doesn't have a team, create a personal team for them
    if (!member) {
      const teamName = profile?.firstName ? `${profile.firstName}'s Team` : "My Team";
      const team = await storage.createTeam({ name: teamName });
      
      // Add user as team owner
      member = await storage.createTeamMember({
        teamId: team.id,
        userId,
        role: "owner",
      });
      
      // Set as active team
      await storage.setActiveTeam(userId, team.id);
      
      return team.id;
    }
    
    // Set the first team as active and return it
    await storage.setActiveTeam(userId, member.teamId);
    return member.teamId;
  };

  // Cookie helper function
  const setCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ) => {
    const isProduction = process.env.NODE_ENV === "production";
    const expiresIn = Math.floor((expiresAt * 1000 - Date.now()) / 1000);

    res.cookie("sb-access-token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn * 1000,
    });

    res.cookie("sb-refresh-token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  };

  // Set session cookies after login
  app.post("/api/auth/set-session", async (req, res) => {
    try {
      const { access_token, refresh_token, expires_at } = req.body;

      if (!access_token || !refresh_token || !expires_at) {
        return res.status(400).json({ error: "Missing session data" });
      }

      // Validate the token by getting the user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(access_token);

      if (error || !user) {
        return res.status(401).json({ error: "Invalid session" });
      }

      setCookies(res, access_token, refresh_token, expires_at);
      res.json({ user });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
    }
  });

  // Get current user from cookie
  app.get("/api/auth/me", authenticateUser, async (req: AuthRequest, res) => {
    try {
      if (req.user?.id && req.user?.email) {
        // Ensure user has a team (creates one if they don't)
        await storage.ensureUserTeam(req.user.id, req.user.email);
      }
      res.json({ user: req.user });
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.json({ user: req.user });
    }
  });

  // Sign out - clear cookies
  app.post("/api/auth/signout", async (req, res) => {
    res.clearCookie("sb-access-token", { path: "/" });
    res.clearCookie("sb-refresh-token", { path: "/" });
    res.json({ success: true });
  });

  // Delete account
  app.delete("/api/auth/delete-account", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);

      // Delete user from Supabase Auth (this will cascade delete user_profiles and team_members due to RLS)
      if (!supabaseAdmin) {
        throw new Error("Supabase admin client not configured");
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete account");
      }

      // Clear cookies
      res.clearCookie("sb-access-token", { path: "/" });
      res.clearCookie("sb-refresh-token", { path: "/" });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Multer configuration for avatar uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(null, false); // Reject silently, will be handled in route
    },
  });

  // Get user profile
  app.get("/api/user/profile", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Create or update user profile
  app.post("/api/user/profile", authenticateUser, upload.single("avatar"), async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const firstName = req.body.firstName?.trim();
      const lastName = req.body.lastName?.trim();
      const inviteCode = req.body.inviteCode?.trim();

      // Validate required fields (after trimming)
      if (!firstName || !lastName) {
        return res.status(400).json({ error: "First name and last name are required" });
      }

      // Upload avatar to object storage if provided
      let avatarUrl: string | undefined;
      if (req.file) {
        if (!supabaseAdmin) {
          throw new Error("Supabase admin client not configured");
        }

        // Sanitize filename to prevent path traversal
        const ext = path.extname(req.file.originalname).toLowerCase();
        const basename = path.basename(req.file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 50);
        const safeFilename = `${basename}${ext}`;

        const fileName = `public/avatars/${userId}/${Date.now()}-${safeFilename}`;
        
        const { data, error } = await supabaseAdmin.storage
          .from('shoot-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: "public, max-age=31536000",
            upsert: false,
          });

        if (error) {
          throw new Error(`Failed to upload avatar: ${error.message}`);
        }
        
        // Get the public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('shoot-images')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrlData.publicUrl;
      }

      // Create or update user profile
      const existingProfile = await storage.getUserProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, {
          firstName,
          lastName,
          ...(avatarUrl && { avatarUrl }),
        });
      } else {
        const profileData = insertUserProfileSchema.parse({
          userId,
          firstName,
          lastName,
          ...(avatarUrl && { avatarUrl }),
        });
        profile = await storage.createUserProfile(profileData);
      }

      // Check if user is already part of a team
      const existingTeamMember = await storage.getUserTeamMember(userId);
      
      if (!existingTeamMember) {
        // Handle team invite if provided
        if (inviteCode) {
          const invite = await storage.getTeamInviteByCode(inviteCode);
          if (invite) {
            try {
              await storage.createTeamMember({
                teamId: invite.teamId,
                userId,
                role: "member",
              });
            } catch (error: any) {
              // Check if it's a duplicate key error (user already a member)
              if (error.code === '23505' || error.message?.includes('duplicate')) {
                // Silently ignore duplicate team membership
                console.log("User already a team member");
              } else {
                throw error; // Re-throw other errors
              }
            }
          }
        } else {
          // No invite code - create a personal team for the user
          const teamName = `${firstName}'s Team`;
          const team = await storage.createTeam({ name: teamName });
          
          // Add user as team owner
          await storage.createTeamMember({
            teamId: team.id,
            userId,
            role: "owner",
          });
        }
      }

      res.json({ profile });
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create profile" 
      });
    }
  });

  // Get user's team membership for active team
  app.get("/api/user/team-member", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      
      // Get user's active team ID
      const teamId = await getUserTeamId(userId);
      
      // Get the team membership for the active team
      const teamMember = await storage.getTeamMember(teamId, userId);
      
      if (!teamMember) {
        return res.status(404).json({ error: "No team membership found" });
      }
      res.json(teamMember);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ error: "Failed to fetch team membership" });
    }
  });

  // Get team details
  app.get("/api/team/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;
      
      // Verify user is a member of this specific team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Unauthorized to access this team" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  // Update team
  app.patch("/api/team/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;
      
      // Verify user is owner or admin of this specific team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Unauthorized to update this team" });
      }
      if (teamMember.role !== "owner" && teamMember.role !== "admin") {
        return res.status(403).json({ error: "Only team owners and admins can update the team" });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Team name is required" });
      }

      const updatedTeam = await storage.updateTeam(teamId, { name });
      if (!updatedTeam) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  // Create a new team
  app.post("/api/team", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Team name is required" });
      }

      // Create the team
      const newTeam = await storage.createTeam({
        name: name.trim(),
      });

      // Add user as owner of the new team
      await storage.createTeamMember({
        teamId: newTeam.id,
        userId,
        role: "owner",
      });

      // Set as active team
      await storage.setActiveTeam(userId, newTeam.id);

      res.json(newTeam);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  // Delete a team
  app.delete("/api/team/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;

      // Verify user is the owner of this team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Unauthorized to delete this team" });
      }
      if (teamMember.role !== "owner") {
        return res.status(403).json({ error: "Only team owners can delete the team" });
      }

      // Count how many teams the user owns
      const userTeams = await storage.getUserTeams(userId);
      const ownedTeamsCount = userTeams.filter(team => team.role === "owner").length;

      // Prevent deletion if this is the user's only owned team
      if (ownedTeamsCount <= 1) {
        return res.status(400).json({ 
          error: "Cannot delete your only owned team. You must own at least one team." 
        });
      }

      // Delete the team (cascading deletes will handle team members, etc.)
      const deleted = await storage.deleteTeam(teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Team not found" });
      }

      // If this was the active team, switch to another owned team
      const profile = await storage.getUserProfile(userId);
      if (profile?.activeTeamId === teamId) {
        const anotherOwnedTeam = userTeams.find(
          team => team.role === "owner" && team.id !== teamId
        );
        if (anotherOwnedTeam) {
          await storage.setActiveTeam(userId, anotherOwnedTeam.id);
        }
      }

      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  // Join a team using invite code
  app.post("/api/team/join", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ error: "Invite code is required" });
      }

      // Find the invite
      const invite = await storage.getTeamInviteByCode(inviteCode);
      if (!invite) {
        return res.status(404).json({ error: "Invalid invite code" });
      }

      // Check if user is already a member of this specific team
      const existingTeamMembership = await storage.getTeamMember(invite.teamId, userId);
      if (existingTeamMembership) {
        return res.status(400).json({ error: "You are already a member of this team" });
      }

      // Join the team
      const teamMember = await storage.createTeamMember({
        teamId: invite.teamId,
        userId,
        role: "member",
      });

      // Set this team as the active team
      await storage.setActiveTeam(userId, invite.teamId);

      res.json({ teamMember, message: "Successfully joined the team" });
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(500).json({ error: "Failed to join team" });
    }
  });

  // Leave current team
  app.delete("/api/team/leave", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);

      // Get active team membership
      const teamId = await getUserTeamId(userId);
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(404).json({ error: "You are not part of any team" });
      }

      // Delete team membership
      await storage.deleteTeamMember(teamMember.id);

      // Create a new personal team
      const profile = await storage.getUserProfile(userId);
      const teamName = profile?.firstName ? `${profile.firstName}'s Team` : "My Team";
      const newTeam = await storage.createTeam({ name: teamName });

      // Add user as owner of new team
      await storage.createTeamMember({
        teamId: newTeam.id,
        userId,
        role: "owner",
      });

      // Set the new team as active
      await storage.setActiveTeam(userId, newTeam.id);

      res.json({ message: "Left team successfully and created new personal team" });
    } catch (error) {
      console.error("Error leaving team:", error);
      res.status(500).json({ error: "Failed to leave team" });
    }
  });

  // Get all teams for the current user
  app.get("/api/user/teams", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error getting user teams:", error);
      res.status(500).json({ error: "Failed to get user teams" });
    }
  });

  // Set active team for the current user
  app.post("/api/user/active-team", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.body;

      if (!teamId) {
        return res.status(400).json({ error: "Team ID is required" });
      }

      // Verify user is a member of the team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "You are not a member of this team" });
      }

      const profile = await storage.setActiveTeam(userId, teamId);
      if (!profile) {
        return res.status(500).json({ error: "Failed to set active team" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error setting active team:", error);
      res.status(500).json({ error: "Failed to set active team" });
    }
  });

  // Get or create team invite code
  app.get("/api/team/:id/invite", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;

      // Verify user is part of this specific team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "You are not authorized to access this team" });
      }

      // Check if invite already exists
      let invite = await storage.getTeamInviteByTeamId(teamId);
      
      // If not, create one
      if (!invite) {
        const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        invite = await storage.createTeamInvite({
          teamId,
          inviteCode,
          createdBy: userId,
        });
      }

      // Create invite URL
      const baseUrl = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : req.protocol + '://' + req.get('host');
      const inviteUrl = `${baseUrl}/auth?inviteCode=${invite.inviteCode}`;

      res.json({
        code: invite.inviteCode,
        inviteUrl,
      });
    } catch (error) {
      console.error("Error getting team invite:", error);
      res.status(500).json({ error: "Failed to get team invite" });
    }
  });

  // Send team invite email
  app.post("/api/team/:id/invite/send", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Verify user is part of the team
      const teamMember = await storage.getUserTeamMember(userId);
      if (!teamMember || teamMember.teamId !== teamId) {
        return res.status(403).json({ error: "You are not authorized to invite users to this team" });
      }

      // Get team and invite code
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      let invite = await storage.getTeamInviteByTeamId(teamId);
      if (!invite) {
        const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        invite = await storage.createTeamInvite({
          teamId,
          inviteCode,
          createdBy: userId,
        });
      }

      // Send email using Resend
      const { Resend } = await import('resend');
      
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY 
        ? 'repl ' + process.env.REPL_IDENTITY 
        : process.env.WEB_REPL_RENEWAL 
        ? 'depl ' + process.env.WEB_REPL_RENEWAL 
        : null;

      if (!xReplitToken) {
        throw new Error('X_REPLIT_TOKEN not found for repl/depl');
      }

      const connectionSettings = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      ).then(res => res.json()).then(data => data.items?.[0]);

      if (!connectionSettings || !connectionSettings.settings.api_key) {
        throw new Error('Resend not connected');
      }

      const resend = new Resend(connectionSettings.settings.api_key);
      const fromEmail = connectionSettings.settings.from_email;

      // Get user profile
      const profile = await storage.getUserProfile(userId);
      const inviterName = profile ? `${profile.firstName} ${profile.lastName}` : "A team member";

      // Create invite link
      const baseUrl = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : req.protocol + '://' + req.get('host');
      const inviteLink = `${baseUrl}/auth?inviteCode=${invite.inviteCode}`;

      // Send email
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `You're invited to join ${team.name} on Cosplay Photo Shoot Tracker`,
        html: `
          <h2>You've been invited!</h2>
          <p>${inviterName} has invited you to join <strong>${team.name}</strong> on Cosplay Photo Shoot Tracker.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px;">Join ${team.name}</a></p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${inviteLink}</p>
          <p>Your invite code is: <strong>${invite.inviteCode}</strong></p>
        `,
      });

      res.json({ message: "Invite email sent successfully" });
    } catch (error) {
      console.error("Error sending invite email:", error);
      res.status(500).json({ error: "Failed to send invite email" });
    }
  });

  // Get team members list
  app.get("/api/team/:id/members", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = req.params.id;
      
      // Verify user is part of this specific team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Unauthorized to access this team" });
      }

      const members = await storage.getTeamMembers(teamId);
      
      // Fetch user profiles and emails for all members
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          const profile = await storage.getUserProfile(member.userId);
          
          // Get user email from Supabase Auth using admin client
          let userEmail = '';
          if (supabaseAdmin) {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(member.userId);
            userEmail = userData?.user?.email || '';
          }
          
          return {
            ...member,
            profile,
            user: {
              email: userEmail,
            },
          };
        })
      );

      res.json(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Update team member role
  app.patch("/api/team/:teamId/members/:memberId/role", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const { teamId, memberId } = req.params;
      const { role } = req.body;

      // Only allow admin and member roles - owner role changes require a dedicated transfer ownership flow
      if (!role || !['admin', 'member'].includes(role)) {
        return res.status(400).json({ error: "Valid role is required (admin or member)" });
      }

      // Get actor's team membership and role for this specific team
      const actorMember = await storage.getTeamMember(teamId, userId);
      if (!actorMember) {
        return res.status(403).json({ error: "Unauthorized to modify this team" });
      }

      // Only owners and admins can change roles
      if (actorMember.role !== "owner" && actorMember.role !== "admin") {
        return res.status(403).json({ error: "Only owners and admins can change member roles" });
      }

      // Get target member's current details by their record ID
      const targetMember = await storage.getTeamMemberById(memberId);
      if (!targetMember) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Verify the target member belongs to this team
      if (targetMember.teamId !== teamId) {
        return res.status(403).json({ error: "Team member not found in this team" });
      }

      // Prevent changing owner roles - ownership transfers require a dedicated flow
      if (targetMember.role === "owner") {
        return res.status(403).json({ 
          error: "Cannot change the role of a team owner. Ownership transfers are not currently supported." 
        });
      }

      // Check if actor can modify this target member
      const { canModifyTeamMember } = await import("./middleware/permissions");
      const canModify = await canModifyTeamMember(
        actorMember.role as "owner" | "admin" | "member",
        targetMember.role as "owner" | "admin" | "member"
      );

      if (!canModify) {
        return res.status(403).json({ 
          error: "You cannot modify this member's role. Admins can only modify regular members." 
        });
      }

      // Update the role
      const updatedMember = await storage.updateTeamMember(targetMember.id, { role });
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating team member role:", error);
      res.status(500).json({ error: "Failed to update member role" });
    }
  });

  // Remove team member
  app.delete("/api/team/:teamId/members/:memberId", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const { teamId, memberId } = req.params;

      // Get actor's team membership and role for this specific team
      const actorMember = await storage.getTeamMember(teamId, userId);
      if (!actorMember) {
        return res.status(403).json({ error: "Unauthorized to modify this team" });
      }

      // Only owners and admins can remove members
      if (actorMember.role !== "owner" && actorMember.role !== "admin") {
        return res.status(403).json({ error: "Only owners and admins can remove members" });
      }

      // Get target member by ID
      const members = await storage.getTeamMembers(teamId);
      const targetMember = members.find(m => m.id === memberId);
      
      if (!targetMember) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Check if actor can modify this target member
      const { canModifyTeamMember } = await import("./middleware/permissions");
      const canModify = await canModifyTeamMember(
        actorMember.role as "owner" | "admin" | "member",
        targetMember.role as "owner" | "admin" | "member"
      );

      if (!canModify) {
        return res.status(403).json({ 
          error: "You cannot remove this member. Admins can only remove regular members." 
        });
      }

      // Don't allow removing yourself
      if (targetMember.userId === userId) {
        return res.status(400).json({ error: "Use the leave team endpoint to leave the team" });
      }

      // Remove the member
      await storage.deleteTeamMember(targetMember.id);
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ error: "Failed to remove team member" });
    }
  });

  // Object Storage Routes
  // Serve uploaded images with authentication and ACL
  app.get("/objects/:objectPath(*)", authenticateUser, async (req: AuthRequest, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned URL for image upload
  app.post("/api/objects/upload", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Google Maps Places API Autocomplete Proxy
  app.get("/api/places/autocomplete", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured" });
      }

      // Use Places API (New) Autocomplete
      const url = `https://places.googleapis.com/v1/places:autocomplete`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
        },
        body: JSON.stringify({
          input: q,
          includedPrimaryTypes: ['street_address', 'premise', 'point_of_interest', 'establishment'],
        }),
      });
      
      if (!response.ok) {
        console.error(`Google Places autocomplete failed: ${response.status} ${response.statusText}`);
        return res.status(502).json({ error: "Location service unavailable", predictions: [] });
      }
      
      const data = await response.json();
      
      // Get place details for each suggestion to get coordinates
      if (data.suggestions && data.suggestions.length > 0) {
        const detailedSuggestions = await Promise.all(
          data.suggestions.slice(0, 5).map(async (suggestion: any) => {
            if (!suggestion.placePrediction?.placeId) return null;
            
            const detailsUrl = `https://places.googleapis.com/v1/places/${suggestion.placePrediction.placeId}`;
            const detailsResponse = await fetch(detailsUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
              },
            });
            
            if (!detailsResponse.ok) {
              console.error(`Google Place details failed for ${suggestion.placePrediction.placeId}: ${detailsResponse.status}`);
              return null;
            }
            
            const details = await detailsResponse.json();
            
            // Validate we have valid coordinates before returning
            const hasValidCoordinates = 
              typeof details.location?.latitude === 'number' && 
              typeof details.location?.longitude === 'number' &&
              Number.isFinite(details.location.latitude) &&
              Number.isFinite(details.location.longitude);
            
            if (!hasValidCoordinates) {
              console.warn(`Missing or invalid coordinates for place ${suggestion.placePrediction.placeId}`);
              return null;
            }
            
            return {
              placeId: details.id,
              name: details.displayName?.text || suggestion.placePrediction.text?.text || '',
              address: details.formattedAddress || '',
              latitude: details.location.latitude,
              longitude: details.location.longitude,
            };
          })
        );
        
        res.json({ 
          predictions: detailedSuggestions.filter(p => p !== null) 
        });
      } else {
        res.json({ predictions: [] });
      }
    } catch (error) {
      console.error("Google Maps Places API error:", error);
      res.status(500).json({ error: "Failed to fetch location data", predictions: [] });
    }
  });

  // Get shoot resources
  app.get("/api/shoots/:id/equipment", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      const shoot = await storage.getTeamShoot(req.params.id, teamId);
      if (!shoot) {
        return res.sendStatus(404);
      }
      const equipment = await storage.getShootEquipment(req.params.id);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching shoot equipment:", error);
      res.sendStatus(500);
    }
  });

  app.get("/api/shoots/:id/props", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      const shoot = await storage.getTeamShoot(req.params.id, teamId);
      if (!shoot) {
        return res.sendStatus(404);
      }
      const shootProps = await storage.getShootProps(req.params.id);
      res.json(shootProps);
    } catch (error) {
      console.error("Error fetching shoot props:", error);
      res.sendStatus(500);
    }
  });

  app.get("/api/shoots/:id/costumes", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      const shoot = await storage.getTeamShoot(req.params.id, teamId);
      if (!shoot) {
        return res.sendStatus(404);
      }
      const costumes = await storage.getShootCostumes(req.params.id);
      res.json(costumes);
    } catch (error) {
      console.error("Error fetching shoot costumes:", error);
      res.sendStatus(500);
    }
  });

  // Get all shoots for user's team
  app.get("/api/shoots", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      const shoots = await storage.getTeamShoots(teamId);
      res.json(shoots);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load shoots" });
    }
  });

  // Get single shoot
  app.get(
    "/api/shoots/:id",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        res.json(shoot);
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Create new shoot
  app.post("/api/shoots", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      
      // Check user's role - only owner/admin can create shoots
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
        return res.status(403).json({ error: "Only team owners and admins can create shoots" });
      }
      
      const { shoot, personnelIds = [], equipmentIds = [], propIds = [], costumeIds = [], participants = [] } = req.body;
      
      const data = insertShootSchema.parse({ ...shoot, userId, teamId });
      const createdShoot = await storage.createShoot(data);
      
      // Create participant associations from participants array (with roles)
      if (participants.length > 0) {
        for (const participant of participants) {
          const personnel = await storage.getPersonnel(participant.personnelId, teamId);
          if (personnel) {
            await storage.createShootParticipant({
              shootId: createdShoot.id,
              name: personnel.name,
              role: participant.role || "Participant",
              email: personnel.email,
              personnelId: personnel.id,
            });
          }
        }
      }
      
      // Fallback: Create personnel/participant associations from personnelIds (for backward compatibility)
      if (personnelIds.length > 0 && participants.length === 0) {
        for (const personnelId of personnelIds) {
          const personnel = await storage.getPersonnel(personnelId, teamId);
          if (personnel) {
            await storage.createShootParticipant({
              shootId: createdShoot.id,
              name: personnel.name,
              role: "Participant",
              email: personnel.email,
              personnelId: personnel.id,
            });
          }
        }
      }
      
      // Create resource associations
      if (equipmentIds.length > 0) {
        for (const equipmentId of equipmentIds) {
          await storage.createShootEquipment({
            shootId: createdShoot.id,
            equipmentId,
            quantity: 1,
          });
        }
      }
      
      if (propIds.length > 0) {
        for (const propId of propIds) {
          await storage.createShootProp({
            shootId: createdShoot.id,
            propId,
          });
        }
      }
      
      if (costumeIds.length > 0) {
        for (const costumeId of costumeIds) {
          await storage.createShootCostume({
            shootId: createdShoot.id,
            costumeId,
          });
        }
      }
      
      res.status(201).json(createdShoot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res
        .status(401)
        .json({
          error: error instanceof Error ? error.message : "Unauthorized",
        });
    }
  });

  // Update shoot
  app.patch(
    "/api/shoots/:id",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can update shoots
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can update shoots" });
        }
        
        const updateSchema = insertShootSchema.omit({ userId: true, teamId: true }).partial();
        const data = updateSchema.parse(req.body);
        const shoot = await storage.updateTeamShoot(req.params.id, teamId, data);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        res.json(shoot);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Delete shoot
  app.delete(
    "/api/shoots/:id",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can delete shoots
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can delete shoots" });
        }
        
        const deleted = await storage.deleteTeamShoot(req.params.id, teamId);
        if (!deleted) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        res.status(204).send();
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Update shoot resources
  app.patch(
    "/api/shoots/:id/resources",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can update shoot resources
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can update shoot resources" });
        }
        
        // Verify shoot exists in team
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }

        const { equipmentIds = [], propIds = [], costumeIds = [], personnelIds = [], participants = [] } = req.body;

        // Delete existing associations
        await storage.deleteShootEquipment(req.params.id);
        await storage.deleteShootProps(req.params.id);
        await storage.deleteShootCostumes(req.params.id);

        // Create new equipment associations
        for (const equipmentId of equipmentIds) {
          await storage.createShootEquipment({
            shootId: req.params.id,
            equipmentId,
            quantity: 1,
          });
        }

        // Create new prop associations
        for (const propId of propIds) {
          await storage.createShootProp({
            shootId: req.params.id,
            propId,
          });
        }

        // Create new costume associations
        for (const costumeId of costumeIds) {
          await storage.createShootCostume({
            shootId: req.params.id,
            costumeId,
          });
        }

        // Update participants
        await storage.deleteShootParticipants(req.params.id);
        
        // Recreate all participants (preserves both manual and personnel-linked)
        for (const participant of participants) {
          await storage.createShootParticipant({
            shootId: req.params.id,
            personnelId: participant.personnelId || null,
            name: participant.name,
            role: participant.role,
            email: participant.email || null,
          });
        }
        
        // Add any newly selected personnel not already in participants
        const existingPersonnelIds = new Set(
          participants.filter((p: any) => p.personnelId).map((p: any) => p.personnelId)
        );
        for (const personnelId of personnelIds) {
          if (!existingPersonnelIds.has(personnelId)) {
            const person = await storage.getPersonnel(personnelId, teamId);
            if (person) {
              await storage.createShootParticipant({
                shootId: req.params.id,
                personnelId,
                name: person.name,
                role: "Participant",
              });
            }
          }
        }

        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to update resources",
        });
      }
    },
  );

  // Get shoot references
  app.get(
    "/api/shoots/:id/references",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        const references = await storage.getShootReferences(req.params.id);
        res.json(references);
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Add shoot reference
  app.post(
    "/api/shoots/:id/references",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can add references
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can add references" });
        }
        
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        
        // If imageUrl is from object storage, set ACL policy
        let imageUrl = req.body.imageUrl;
        if (imageUrl && (imageUrl.includes('/storage/v1/object/') || imageUrl.includes('supabase.co'))) {
          const objectStorageService = new ObjectStorageService();
          imageUrl = await objectStorageService.trySetObjectEntityAclPolicy(
            imageUrl,
            {
              owner: userId,
              visibility: "public",
            },
          );
        }
        
        const data = insertShootReferenceSchema.parse({
          ...req.body,
          imageUrl,
          shootId: req.params.id,
        });
        const reference = await storage.createShootReference(data);
        res.status(201).json(reference);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Delete shoot reference
  app.delete(
    "/api/references/:id",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can delete references
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can delete references" });
        }
        
        const reference = await storage.getShootReferenceById(req.params.id);
        if (!reference) {
          return res.status(404).json({ error: "Reference not found" });
        }
        const shoot = await storage.getTeamShoot(reference.shootId, teamId);
        if (!shoot) {
          return res.status(403).json({ error: "Forbidden" });
        }
        await storage.deleteShootReference(req.params.id);
        res.status(204).send();
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Get shoot participants
  app.get(
    "/api/shoots/:id/participants",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        const participants = await storage.getShootParticipants(req.params.id);
        res.json(participants);
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Add shoot participant
  app.post(
    "/api/shoots/:id/participants",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can add participants
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can add participants" });
        }
        
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        const data = insertShootParticipantSchema.parse({
          ...req.body,
          shootId: req.params.id,
        });
        const participant = await storage.createShootParticipant(data);
        res.status(201).json(participant);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Delete shoot participant
  app.delete(
    "/api/participants/:id",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can delete participants
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can delete participants" });
        }
        
        const participant = await storage.getShootParticipantById(
          req.params.id,
        );
        if (!participant) {
          return res.status(404).json({ error: "Participant not found" });
        }
        const shoot = await storage.getTeamShoot(participant.shootId, teamId);
        if (!shoot) {
          return res.status(403).json({ error: "Forbidden" });
        }
        await storage.deleteShootParticipant(req.params.id);
        res.status(204).send();
      } catch (error) {
        res
          .status(401)
          .json({
            error: error instanceof Error ? error.message : "Unauthorized",
          });
      }
    },
  );

  // Export shoot to Google Docs
  app.post(
    "/api/shoots/:id/export-doc",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can export docs
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can export documents" });
        }
        
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }

        const participants = await storage.getShootParticipants(req.params.id);
        const references = await storage.getShootReferences(req.params.id);

        const { docId, docUrl } = await createShootDocument({
          ...shoot,
          participants,
          references,
        });

        const updatedShoot = await storage.updateTeamShoot(req.params.id, teamId, {
          docsUrl: docUrl,
        });

        res.json({ docId, docUrl, shoot: updatedShoot });
      } catch (error) {
        console.error("Error exporting to Google Docs:", error);
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to export to Google Docs",
        });
      }
    },
  );

  // Create calendar event for shoot
  app.post(
    "/api/shoots/:id/create-calendar-event",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can create calendar events
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can create calendar events" });
        }
        
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }

        if (!shoot.date) {
          return res.status(400).json({ error: "Shoot must have a date to create calendar event" });
        }

        // Check if calendar event already exists (idempotency)
        if (shoot.calendarEventId && shoot.calendarEventUrl) {
          return res.status(409).json({ 
            eventId: shoot.calendarEventId, 
            eventUrl: shoot.calendarEventUrl,
            message: "Calendar event already exists" 
          });
        }

        // Validate and convert date
        const startDate = new Date(shoot.date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }

        const { eventId, eventUrl } = await createCalendarEvent(
          shoot.title,
          shoot.description,
          startDate,
          shoot.locationNotes || null
        );

        const updatedShoot = await storage.updateTeamShoot(req.params.id, teamId, {
          calendarEventId: eventId,
          calendarEventUrl: eventUrl,
        });

        res.json({ eventId, eventUrl, shoot: updatedShoot });
      } catch (error) {
        console.error("Error creating calendar event:", error);
        
        // Better error handling for missing Google Calendar connection
        if (error instanceof Error && error.message.includes('Google Calendar not connected')) {
          return res.status(503).json({
            error: "Please connect your Google Calendar account to use this feature"
          });
        }

        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create calendar event",
        });
      }
    },
  );

  // Send email reminders to participants
  app.post(
    "/api/shoots/:id/send-reminders",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const teamId = await getUserTeamId(userId);
        
        // Check user's role - only owner/admin can send reminders
        const teamMember = await storage.getTeamMember(teamId, userId);
        if (!teamMember || (teamMember.role !== "owner" && teamMember.role !== "admin")) {
          return res.status(403).json({ error: "Only team owners and admins can send reminders" });
        }
        
        const shoot = await storage.getTeamShoot(req.params.id, teamId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }

        if (!shoot.date) {
          return res.status(400).json({ error: "Shoot must have a date to send reminders" });
        }

        // Validate and convert date
        const shootDate = new Date(shoot.date);
        if (isNaN(shootDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }

        const participants = await storage.getShootParticipants(req.params.id);
        
        if (participants.length === 0) {
          return res.status(400).json({ error: "No participants to send reminders to" });
        }

        const participantsWithEmail = participants.filter(p => p.email);
        
        if (participantsWithEmail.length === 0) {
          return res.status(400).json({ error: "No participants have email addresses" });
        }

        // Send emails to all participants
        const emailPromises = participantsWithEmail.map(participant =>
          sendShootReminder({
            shootTitle: shoot.title,
            shootDate,
            shootLocation: shoot.locationNotes || undefined,
            participantEmail: participant.email!,
            participantName: participant.name,
          })
        );

        await Promise.all(emailPromises);

        res.json({ 
          success: true, 
          count: participantsWithEmail.length,
          message: `Reminders sent to ${participantsWithEmail.length} participant${participantsWithEmail.length === 1 ? '' : 's'}` 
        });
      } catch (error) {
        console.error("Error sending reminders:", error);
        
        // Better error handling for missing Resend connection
        if (error instanceof Error && error.message.includes('Resend not connected')) {
          return res.status(503).json({
            error: "Please connect your Resend email account to use this feature"
          });
        }

        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to send reminders",
        });
      }
    },
  );

  // Create or update Google Doc for shoot
  app.post("/api/shoots/:id/docs", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const teamId = await getUserTeamId(userId);
      
      const shoot = await storage.getTeamShoot(req.params.id, teamId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }

      // Get full shoot details
      const participants = await storage.getShootParticipants(req.params.id);
      const references = await storage.getShootReferences(req.params.id);
      const shootEquipment = await storage.getShootEquipment(req.params.id);
      const shootProps = await storage.getShootProps(req.params.id);
      const shootCostumes = await storage.getShootCostumes(req.params.id);
      
      const equipmentIds = shootEquipment.map((e: any) => e.equipmentId);
      const propIds = shootProps.map((p: any) => p.propId);
      const costumeIds = shootCostumes.map((c: any) => c.costumeId);

      // Fetch related resources
      const equipment = await Promise.all(equipmentIds.map(id => storage.getEquipment(id, teamId)));
      const props = await Promise.all(propIds.map(id => storage.getProp(id, teamId)));
      const costumes = await Promise.all(costumeIds.map(id => storage.getCostumeProgress(id, teamId)));
      const location = shoot.locationId ? await storage.getLocation(shoot.locationId, teamId) : null;

      const shootWithDetails = {
        ...shoot,
        participants,
        references,
        equipment: equipment.filter(Boolean),
        props: props.filter(Boolean),
        costumes: costumes.filter(Boolean),
        location,
      };

      // Check if we should update existing doc or create new one
      let docId: string;
      let docUrl: string;
      
      if (shoot.docsId) {
        // Update existing document by clearing and recreating content
        const { updateShootDocument } = await import('./services/docs-update');
        const result = await updateShootDocument(shoot.docsId, shootWithDetails as any);
        
        docId = result.docId;
        docUrl = result.docUrl;
      } else {
        // Create new document
        const result = await createShootDocument(shootWithDetails as any);
        docId = result.docId;
        docUrl = result.docUrl;
      }

      // Update shoot with doc info
      await storage.updateShoot(req.params.id, teamId, {
        docsId: docId,
        docsUrl: docUrl,
      });

      res.json({ docId, docUrl, message: shoot.docsId ? "Document updated successfully" : "Document created successfully" });
    } catch (error) {
      console.error("Error creating shoot document:", error);
      
      if (error instanceof Error && error.message.includes('Google Docs not connected')) {
        return res.status(503).json({
          error: "Please connect your Google Docs account to use this feature"
        });
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create document",
      });
    }
  });

  // Personnel endpoints
  app.get("/api/personnel", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const personnelList = await storage.getTeamPersonnel(teamId);
      res.json(personnelList);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      res.status(500).json({ error: "Failed to fetch personnel" });
    }
  });

  app.post("/api/personnel", authenticateUser, upload.single("avatar"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      
      // Upload avatar to object storage if provided
      let avatarUrl: string | undefined;
      if (req.file) {
        if (!supabaseAdmin) {
          throw new Error("Supabase admin client not configured");
        }

        // Sanitize filename to prevent path traversal
        const ext = path.extname(req.file.originalname).toLowerCase();
        const basename = path.basename(req.file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 50);
        const safeFilename = `${basename}${ext}`;

        const fileName = `public/personnel/${teamId}/${Date.now()}-${safeFilename}`;
        
        const { data, error } = await supabaseAdmin.storage
          .from('shoot-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: "public, max-age=31536000",
            upsert: false,
          });

        if (error) {
          throw new Error(`Failed to upload avatar: ${error.message}`);
        }
        
        // Get the public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('shoot-images')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrlData.publicUrl;
      }
      
      const data = insertPersonnelSchema.parse({ 
        ...req.body, 
        teamId,
        ...(avatarUrl && { avatarUrl })
      });
      const person = await storage.createPersonnel(data);
      res.status(201).json(person);
    } catch (error) {
      console.error("Error creating personnel:", error);
      res.status(400).json({ error: "Failed to create personnel" });
    }
  });

  app.patch("/api/personnel/:id", authenticateUser, upload.single("avatar"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const updated = await storage.updatePersonnel(req.params.id, teamId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Personnel not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating personnel:", error);
      res.status(500).json({ error: "Failed to update personnel" });
    }
  });

  app.delete("/api/personnel/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const deleted = await storage.deletePersonnel(req.params.id, teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Personnel not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting personnel:", error);
      res.status(500).json({ error: "Failed to delete personnel" });
    }
  });

  // Equipment endpoints
  app.get("/api/equipment", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const equipmentList = await storage.getTeamEquipment(teamId);
      res.json(equipmentList);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const data = insertEquipmentSchema.parse({ ...req.body, teamId });
      const item = await storage.createEquipment(data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating equipment:", error);
      res.status(400).json({ error: "Failed to create equipment" });
    }
  });

  app.patch("/api/equipment/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const updated = await storage.updateEquipment(req.params.id, teamId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating equipment:", error);
      res.status(500).json({ error: "Failed to update equipment" });
    }
  });

  app.delete("/api/equipment/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const deleted = await storage.deleteEquipment(req.params.id, teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      res.status(500).json({ error: "Failed to delete equipment" });
    }
  });

  // Locations endpoints
  app.get("/api/locations", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const locationsList = await storage.getTeamLocations(teamId);
      res.json(locationsList);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const data = insertLocationSchema.parse({ ...req.body, teamId });
      const location = await storage.createLocation(data);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(400).json({ error: "Failed to create location" });
    }
  });

  app.patch("/api/locations/:id", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const updated = await storage.updateLocation(req.params.id, teamId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const deleted = await storage.deleteLocation(req.params.id, teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  // Props endpoints
  app.get("/api/props", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const propsList = await storage.getTeamProps(teamId);
      res.json(propsList);
    } catch (error) {
      console.error("Error fetching props:", error);
      res.status(500).json({ error: "Failed to fetch props" });
    }
  });

  app.post("/api/props", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const bodyData = { 
        ...req.body, 
        teamId,
        available: req.body.available === "true" || req.body.available === true
      };
      const data = insertPropSchema.parse(bodyData);
      const prop = await storage.createProp(data);
      res.status(201).json(prop);
    } catch (error) {
      console.error("Error creating prop:", error);
      res.status(400).json({ error: "Failed to create prop" });
    }
  });

  app.patch("/api/props/:id", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const bodyData = { 
        ...req.body,
        available: req.body.available === "true" || req.body.available === true
      };
      const validatedData = insertPropSchema.partial().parse(bodyData);
      const updated = await storage.updateProp(req.params.id, teamId, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Prop not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating prop:", error);
      res.status(400).json({ error: "Failed to update prop" });
    }
  });

  app.delete("/api/props/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const deleted = await storage.deleteProp(req.params.id, teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Prop not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prop:", error);
      res.status(500).json({ error: "Failed to delete prop" });
    }
  });

  // Costume Progress endpoints
  app.get("/api/costumes", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const costumesList = await storage.getTeamCostumes(teamId);
      res.json(costumesList);
    } catch (error) {
      console.error("Error fetching costumes:", error);
      res.status(500).json({ error: "Failed to fetch costumes" });
    }
  });

  app.post("/api/costumes", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const bodyData = {
        ...req.body,
        teamId,
        completionPercentage: req.body.completionPercentage ? parseInt(req.body.completionPercentage, 10) : 0,
        todos: req.body.todos ? JSON.parse(req.body.todos) : []
      };
      const data = insertCostumeProgressSchema.parse(bodyData);
      const costume = await storage.createCostumeProgress(data);
      res.status(201).json(costume);
    } catch (error) {
      console.error("Error creating costume:", error);
      res.status(400).json({ error: "Failed to create costume" });
    }
  });

  app.patch("/api/costumes/:id", authenticateUser, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const bodyData = {
        ...req.body,
        completionPercentage: req.body.completionPercentage ? parseInt(req.body.completionPercentage, 10) : undefined,
        todos: req.body.todos ? JSON.parse(req.body.todos) : undefined
      };
      const validatedData = insertCostumeProgressSchema.partial().parse(bodyData);
      const updated = await storage.updateCostumeProgress(req.params.id, teamId, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Costume not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating costume:", error);
      res.status(400).json({ error: "Failed to update costume" });
    }
  });

  app.delete("/api/costumes/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const teamId = await getUserTeamId(getUserId(req));
      const deleted = await storage.deleteCostumeProgress(req.params.id, teamId);
      if (!deleted) {
        return res.status(404).json({ error: "Costume not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting costume:", error);
      res.status(500).json({ error: "Failed to delete costume" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
