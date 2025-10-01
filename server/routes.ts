import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShootSchema, insertShootReferenceSchema, insertShootParticipantSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to extract user ID from headers (will be set by Supabase auth)
  const getUserId = (req: any): string => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return userId;
  };

  // Get all shoots for user
  app.get("/api/shoots", async (req, res) => {
    try {
      const userId = getUserId(req);
      const shoots = await storage.getUserShoots(userId);
      res.json(shoots);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Get single shoot
  app.get("/api/shoots/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const shoot = await storage.getShoot(req.params.id, userId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      res.json(shoot);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Create new shoot
  app.post("/api/shoots", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertShootSchema.parse({ ...req.body, userId });
      const shoot = await storage.createShoot(data);
      res.status(201).json(shoot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Update shoot
  app.patch("/api/shoots/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertShootSchema.partial().parse(req.body);
      const shoot = await storage.updateShoot(req.params.id, userId, data);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      res.json(shoot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Delete shoot
  app.delete("/api/shoots/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const deleted = await storage.deleteShoot(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Get shoot references
  app.get("/api/shoots/:id/references", async (req, res) => {
    try {
      getUserId(req); // Verify auth
      const references = await storage.getShootReferences(req.params.id);
      res.json(references);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Add shoot reference
  app.post("/api/shoots/:id/references", async (req, res) => {
    try {
      getUserId(req); // Verify auth
      const data = insertShootReferenceSchema.parse({
        ...req.body,
        shootId: req.params.id,
      });
      const reference = await storage.createShootReference(data);
      res.status(201).json(reference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Delete shoot reference
  app.delete("/api/references/:id", async (req, res) => {
    try {
      getUserId(req); // Verify auth
      const deleted = await storage.deleteShootReference(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Reference not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Get shoot participants
  app.get("/api/shoots/:id/participants", async (req, res) => {
    try {
      getUserId(req); // Verify auth
      const participants = await storage.getShootParticipants(req.params.id);
      res.json(participants);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Add shoot participant
  app.post("/api/shoots/:id/participants", async (req, res) => {
    try {
      getUserId(req); // Verify auth
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
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  // Delete shoot participant
  app.delete("/api/participants/:id", async (req, res) => {
    try {
      getUserId(req); // Verify auth
      const deleted = await storage.deleteShootParticipant(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
