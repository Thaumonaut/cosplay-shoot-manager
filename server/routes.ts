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
import { supabase } from "./supabase";
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
    const member = await storage.getUserTeamMember(userId);
    if (!member) {
      throw new Error("User not part of any team");
    }
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
    res.json({ user: req.user });
  });

  // Sign out - clear cookies
  app.post("/api/auth/signout", async (req, res) => {
    res.clearCookie("sb-access-token", { path: "/" });
    res.clearCookie("sb-refresh-token", { path: "/" });
    res.json({ success: true });
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
        const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
        if (!bucketId) {
          throw new Error("Object storage not configured");
        }

        // Sanitize filename to prevent path traversal
        const ext = path.extname(req.file.originalname).toLowerCase();
        const basename = path.basename(req.file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 50);
        const safeFilename = `${basename}${ext}`;

        const { objectStorageClient } = await import("./objectStorage");
        const bucket = objectStorageClient.bucket(bucketId);
        const fileName = `public/avatars/${userId}/${Date.now()}-${safeFilename}`;
        const file = bucket.file(fileName);
        
        await file.save(req.file.buffer, {
          contentType: req.file.mimetype,
          metadata: {
            cacheControl: "public, max-age=31536000",
          },
        });

        // Make the file publicly readable
        await file.makePublic();
        
        // Get the public URL
        avatarUrl = `https://storage.googleapis.com/${bucketId}/${fileName}`;
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

  // Get all shoots for user with participant counts and first reference
  app.get("/api/shoots", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = getUserId(req);
      const shoots = await storage.getUserShootsWithCounts(userId);
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
        const shoot = await storage.getShoot(req.params.id, userId);
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
      const data = insertShootSchema.parse({ ...req.body, userId });
      const shoot = await storage.createShoot(data);
      res.status(201).json(shoot);
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
        const updateSchema = insertShootSchema.omit({ userId: true }).partial();
        const data = updateSchema.parse(req.body);
        const shoot = await storage.updateShoot(req.params.id, userId, data);
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
        const deleted = await storage.deleteShoot(req.params.id, userId);
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

  // Get shoot references
  app.get(
    "/api/shoots/:id/references",
    authenticateUser,
    async (req: AuthRequest, res) => {
      try {
        const userId = getUserId(req);
        const shoot = await storage.getShoot(req.params.id, userId);
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
        const shoot = await storage.getShoot(req.params.id, userId);
        if (!shoot) {
          return res.status(404).json({ error: "Shoot not found" });
        }
        
        // If imageUrl is from object storage, set ACL policy
        let imageUrl = req.body.imageUrl;
        if (imageUrl && imageUrl.startsWith("https://storage.googleapis.com/")) {
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
        const reference = await storage.getShootReferenceById(req.params.id);
        if (!reference) {
          return res.status(404).json({ error: "Reference not found" });
        }
        const shoot = await storage.getShoot(reference.shootId, userId);
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
        const shoot = await storage.getShoot(req.params.id, userId);
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
        const shoot = await storage.getShoot(req.params.id, userId);
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
        const participant = await storage.getShootParticipantById(
          req.params.id,
        );
        if (!participant) {
          return res.status(404).json({ error: "Participant not found" });
        }
        const shoot = await storage.getShoot(participant.shootId, userId);
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
        const shoot = await storage.getShoot(req.params.id, userId);
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

        const updatedShoot = await storage.updateShoot(req.params.id, userId, {
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
        const shoot = await storage.getShoot(req.params.id, userId);
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

        const updatedShoot = await storage.updateShoot(req.params.id, userId, {
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
        const shoot = await storage.getShoot(req.params.id, userId);
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
      const data = insertPersonnelSchema.parse({ ...req.body, teamId });
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
        completionPercentage: req.body.completionPercentage ? parseInt(req.body.completionPercentage, 10) : 0
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
        completionPercentage: req.body.completionPercentage ? parseInt(req.body.completionPercentage, 10) : undefined
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
