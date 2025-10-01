import { 
  type Shoot, 
  type InsertShoot,
  type ShootReference,
  type InsertShootReference,
  type ShootParticipant,
  type InsertShootParticipant 
} from "@shared/schema";
import { db } from "./db";
import { shoots, shootReferences, shootParticipants } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Shoots
  getShoot(id: string, userId: string): Promise<Shoot | undefined>;
  getUserShoots(userId: string): Promise<Shoot[]>;
  createShoot(shoot: InsertShoot): Promise<Shoot>;
  updateShoot(id: string, userId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined>;
  deleteShoot(id: string, userId: string): Promise<boolean>;
  
  // References
  getShootReferences(shootId: string): Promise<ShootReference[]>;
  getShootReferenceById(id: string): Promise<ShootReference | undefined>;
  createShootReference(reference: InsertShootReference): Promise<ShootReference>;
  deleteShootReference(id: string): Promise<boolean>;
  
  // Participants
  getShootParticipants(shootId: string): Promise<ShootParticipant[]>;
  getShootParticipantById(id: string): Promise<ShootParticipant | undefined>;
  createShootParticipant(participant: InsertShootParticipant): Promise<ShootParticipant>;
  deleteShootParticipant(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getShoot(id: string, userId: string): Promise<Shoot | undefined> {
    const [shoot] = await db
      .select()
      .from(shoots)
      .where(and(eq(shoots.id, id), eq(shoots.userId, userId)));
    return shoot;
  }

  async getUserShoots(userId: string): Promise<Shoot[]> {
    return db
      .select()
      .from(shoots)
      .where(eq(shoots.userId, userId))
      .orderBy(desc(shoots.createdAt));
  }

  async createShoot(shoot: InsertShoot): Promise<Shoot> {
    const [newShoot] = await db.insert(shoots).values(shoot).returning();
    return newShoot;
  }

  async updateShoot(id: string, userId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined> {
    const [updated] = await db
      .update(shoots)
      .set({ ...shoot, updatedAt: new Date() })
      .where(and(eq(shoots.id, id), eq(shoots.userId, userId)))
      .returning();
    return updated;
  }

  async deleteShoot(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(shoots)
      .where(and(eq(shoots.id, id), eq(shoots.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getShootReferences(shootId: string): Promise<ShootReference[]> {
    return db
      .select()
      .from(shootReferences)
      .where(eq(shootReferences.shootId, shootId));
  }

  async getShootReferenceById(id: string): Promise<ShootReference | undefined> {
    const [reference] = await db
      .select()
      .from(shootReferences)
      .where(eq(shootReferences.id, id));
    return reference;
  }

  async createShootReference(reference: InsertShootReference): Promise<ShootReference> {
    const [newRef] = await db.insert(shootReferences).values(reference).returning();
    return newRef;
  }

  async deleteShootReference(id: string): Promise<boolean> {
    const result = await db.delete(shootReferences).where(eq(shootReferences.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getShootParticipants(shootId: string): Promise<ShootParticipant[]> {
    return db
      .select()
      .from(shootParticipants)
      .where(eq(shootParticipants.shootId, shootId));
  }

  async getShootParticipantById(id: string): Promise<ShootParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(shootParticipants)
      .where(eq(shootParticipants.id, id));
    return participant;
  }

  async createShootParticipant(participant: InsertShootParticipant): Promise<ShootParticipant> {
    const [newParticipant] = await db.insert(shootParticipants).values(participant).returning();
    return newParticipant;
  }

  async deleteShootParticipant(id: string): Promise<boolean> {
    const result = await db.delete(shootParticipants).where(eq(shootParticipants.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
