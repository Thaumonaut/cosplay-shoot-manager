import { 
  type Shoot, 
  type InsertShoot,
  type ShootReference,
  type InsertShootReference,
  type ShootParticipant,
  type InsertShootParticipant,
  type Personnel,
  type InsertPersonnel,
  type Equipment,
  type InsertEquipment,
  type Location,
  type InsertLocation,
  type Prop,
  type InsertProp,
  type CostumeProgress,
  type InsertCostumeProgress,
  type Team,
  type InsertTeam,
} from "@shared/schema";
import { db } from "./db";
import { 
  shoots, 
  shootReferences, 
  shootParticipants,
  personnel,
  equipment,
  locations,
  props,
  costumeProgress,
  teams,
} from "@shared/schema";
import { eq, and, desc, sql as rawSql } from "drizzle-orm";

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

  // Personnel
  getPersonnel(id: string, teamId: string): Promise<Personnel | undefined>;
  getTeamPersonnel(teamId: string): Promise<Personnel[]>;
  createPersonnel(person: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: string, teamId: string, person: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: string, teamId: string): Promise<boolean>;

  // Equipment
  getEquipment(id: string, teamId: string): Promise<Equipment | undefined>;
  getTeamEquipment(teamId: string): Promise<Equipment[]>;
  createEquipment(item: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, teamId: string, item: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: string, teamId: string): Promise<boolean>;

  // Locations
  getLocation(id: string, teamId: string): Promise<Location | undefined>;
  getTeamLocations(teamId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, teamId: string, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string, teamId: string): Promise<boolean>;

  // Props
  getProp(id: string, teamId: string): Promise<Prop | undefined>;
  getTeamProps(teamId: string): Promise<Prop[]>;
  createProp(prop: InsertProp): Promise<Prop>;
  updateProp(id: string, teamId: string, prop: Partial<InsertProp>): Promise<Prop | undefined>;
  deleteProp(id: string, teamId: string): Promise<boolean>;

  // Costume Progress
  getCostumeProgress(id: string, teamId: string): Promise<CostumeProgress | undefined>;
  getTeamCostumes(teamId: string): Promise<CostumeProgress[]>;
  createCostumeProgress(costume: InsertCostumeProgress): Promise<CostumeProgress>;
  updateCostumeProgress(id: string, teamId: string, costume: Partial<InsertCostumeProgress>): Promise<CostumeProgress | undefined>;
  deleteCostumeProgress(id: string, teamId: string): Promise<boolean>;

  // Teams
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
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

  async getUserShootsWithCounts(userId: string): Promise<Array<Shoot & { participantCount: number; firstReferenceUrl: string | null }>> {
    const result = await db
      .select({
        shoot: shoots,
        participantCount: rawSql<number>`COALESCE(COUNT(DISTINCT ${shootParticipants.id}), 0)`,
        firstReferenceUrl: rawSql<string | null>`(
          SELECT url
          FROM shoot_references
          WHERE shoot_id = ${shoots.id}
          ORDER BY created_at ASC
          LIMIT 1
        )`,
      })
      .from(shoots)
      .leftJoin(shootParticipants, eq(shoots.id, shootParticipants.shootId))
      .where(eq(shoots.userId, userId))
      .groupBy(shoots.id)
      .orderBy(desc(shoots.createdAt));

    return result.map(row => ({
      ...row.shoot,
      participantCount: Number(row.participantCount),
      firstReferenceUrl: row.firstReferenceUrl,
    }));
  }

  async createShoot(shoot: InsertShoot): Promise<Shoot> {
    const [newShoot] = await db.insert(shoots).values(shoot).returning();
    return newShoot;
  }

  async updateShoot(id: string, userId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined> {
    const { userId: _, ...allowedUpdates } = shoot as any;
    const [updated] = await db
      .update(shoots)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(shoots.id, id), eq(shoots.userId, userId)))
      .returning();
    return updated;
  }

  async deleteShoot(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(shoots)
      .where(and(eq(shoots.id, id), eq(shoots.userId, userId)))
      .returning();
    return result.length > 0;
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
    const result = await db.delete(shootReferences).where(eq(shootReferences.id, id)).returning();
    return result.length > 0;
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
    const result = await db.delete(shootParticipants).where(eq(shootParticipants.id, id)).returning();
    return result.length > 0;
  }

  // Personnel methods
  async getPersonnel(id: string, teamId: string): Promise<Personnel | undefined> {
    const [person] = await db
      .select()
      .from(personnel)
      .where(and(eq(personnel.id, id), eq(personnel.teamId, teamId)));
    return person;
  }

  async getTeamPersonnel(teamId: string): Promise<Personnel[]> {
    return db
      .select()
      .from(personnel)
      .where(eq(personnel.teamId, teamId))
      .orderBy(desc(personnel.createdAt));
  }

  async createPersonnel(person: InsertPersonnel): Promise<Personnel> {
    const [newPerson] = await db.insert(personnel).values(person).returning();
    return newPerson;
  }

  async updatePersonnel(id: string, teamId: string, person: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const { teamId: _, ...allowedUpdates } = person as any;
    const [updated] = await db
      .update(personnel)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(personnel.id, id), eq(personnel.teamId, teamId)))
      .returning();
    return updated;
  }

  async deletePersonnel(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(personnel)
      .where(and(eq(personnel.id, id), eq(personnel.teamId, teamId)))
      .returning();
    return result.length > 0;
  }

  // Equipment methods
  async getEquipment(id: string, teamId: string): Promise<Equipment | undefined> {
    const [item] = await db
      .select()
      .from(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.teamId, teamId)));
    return item;
  }

  async getTeamEquipment(teamId: string): Promise<Equipment[]> {
    return db
      .select()
      .from(equipment)
      .where(eq(equipment.teamId, teamId))
      .orderBy(desc(equipment.createdAt));
  }

  async createEquipment(item: InsertEquipment): Promise<Equipment> {
    const [newItem] = await db.insert(equipment).values(item).returning();
    return newItem;
  }

  async updateEquipment(id: string, teamId: string, item: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const { teamId: _, ...allowedUpdates } = item as any;
    const [updated] = await db
      .update(equipment)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(equipment.id, id), eq(equipment.teamId, teamId)))
      .returning();
    return updated;
  }

  async deleteEquipment(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.teamId, teamId)))
      .returning();
    return result.length > 0;
  }

  // Location methods
  async getLocation(id: string, teamId: string): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, id), eq(locations.teamId, teamId)));
    return location;
  }

  async getTeamLocations(teamId: string): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .where(eq(locations.teamId, teamId))
      .orderBy(desc(locations.createdAt));
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: string, teamId: string, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const { teamId: _, ...allowedUpdates } = location as any;
    const [updated] = await db
      .update(locations)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(locations.id, id), eq(locations.teamId, teamId)))
      .returning();
    return updated;
  }

  async deleteLocation(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(locations)
      .where(and(eq(locations.id, id), eq(locations.teamId, teamId)))
      .returning();
    return result.length > 0;
  }

  // Props methods
  async getProp(id: string, teamId: string): Promise<Prop | undefined> {
    const [prop] = await db
      .select()
      .from(props)
      .where(and(eq(props.id, id), eq(props.teamId, teamId)));
    return prop;
  }

  async getTeamProps(teamId: string): Promise<Prop[]> {
    return db
      .select()
      .from(props)
      .where(eq(props.teamId, teamId))
      .orderBy(desc(props.createdAt));
  }

  async createProp(prop: InsertProp): Promise<Prop> {
    const [newProp] = await db.insert(props).values(prop).returning();
    return newProp;
  }

  async updateProp(id: string, teamId: string, prop: Partial<InsertProp>): Promise<Prop | undefined> {
    const { teamId: _, ...allowedUpdates } = prop as any;
    const [updated] = await db
      .update(props)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(props.id, id), eq(props.teamId, teamId)))
      .returning();
    return updated;
  }

  async deleteProp(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(props)
      .where(and(eq(props.id, id), eq(props.teamId, teamId)))
      .returning();
    return result.length > 0;
  }

  // Costume Progress methods
  async getCostumeProgress(id: string, teamId: string): Promise<CostumeProgress | undefined> {
    const [costume] = await db
      .select()
      .from(costumeProgress)
      .where(and(eq(costumeProgress.id, id), eq(costumeProgress.teamId, teamId)));
    return costume;
  }

  async getTeamCostumes(teamId: string): Promise<CostumeProgress[]> {
    return db
      .select()
      .from(costumeProgress)
      .where(eq(costumeProgress.teamId, teamId))
      .orderBy(desc(costumeProgress.createdAt));
  }

  async createCostumeProgress(costume: InsertCostumeProgress): Promise<CostumeProgress> {
    const [newCostume] = await db.insert(costumeProgress).values(costume).returning();
    return newCostume;
  }

  async updateCostumeProgress(id: string, teamId: string, costume: Partial<InsertCostumeProgress>): Promise<CostumeProgress | undefined> {
    const { teamId: _, ...allowedUpdates } = costume as any;
    const [updated] = await db
      .update(costumeProgress)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(costumeProgress.id, id), eq(costumeProgress.teamId, teamId)))
      .returning();
    return updated;
  }

  async deleteCostumeProgress(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(costumeProgress)
      .where(and(eq(costumeProgress.id, id), eq(costumeProgress.teamId, teamId)))
      .returning();
    return result.length > 0;
  }

  // Team methods
  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const { id: _, ...allowedUpdates } = team as any;
    const [updated] = await db
      .update(teams)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
