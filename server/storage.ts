import { 
  type Shoot, 
  type InsertShoot,
  type ShootReference,
  type InsertShootReference,
  type ShootParticipant,
  type InsertShootParticipant,
  type ShootEquipment,
  type InsertShootEquipment,
  type ShootProp,
  type InsertShootProp,
  type ShootCostume,
  type InsertShootCostume,
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
  type UserProfile,
  type InsertUserProfile,
  type TeamInvite,
  type InsertTeamInvite,
  type TeamMember,
  type InsertTeamMember,
} from "@shared/schema";
import { db } from "./db";
import { 
  shoots, 
  shootReferences, 
  shootParticipants,
  shootEquipment,
  shootProps,
  shootCostumes,
  personnel,
  equipment,
  locations,
  props,
  costumeProgress,
  teams,
  userProfiles,
  teamInvites,
  teamMembers,
} from "@shared/schema";
import { eq, and, desc, sql as rawSql } from "drizzle-orm";

export interface IStorage {
  // Shoots
  getShoot(id: string, userId: string): Promise<Shoot | undefined>;
  getUserShoots(userId: string): Promise<Shoot[]>;
  getTeamShoots(teamId: string): Promise<Shoot[]>;
  getTeamShoot(id: string, teamId: string): Promise<Shoot | undefined>;
  createShoot(shoot: InsertShoot): Promise<Shoot>;
  updateShoot(id: string, userId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined>;
  updateTeamShoot(id: string, teamId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined>;
  deleteShoot(id: string, userId: string): Promise<boolean>;
  deleteTeamShoot(id: string, teamId: string): Promise<boolean>;
  
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

  // Shoot Resource Associations
  getShootEquipment(shootId: string): Promise<Equipment[]>;
  getShootProps(shootId: string): Promise<Prop[]>;
  getShootCostumes(shootId: string): Promise<CostumeProgress[]>;
  createShootEquipment(association: InsertShootEquipment): Promise<ShootEquipment>;
  createShootProp(association: InsertShootProp): Promise<ShootProp>;
  createShootCostume(association: InsertShootCostume): Promise<ShootCostume>;

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

  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // Team Invites
  getTeamInviteByCode(inviteCode: string): Promise<TeamInvite | undefined>;
  getTeamInviteByTeamId(teamId: string): Promise<TeamInvite | undefined>;
  createTeamInvite(invite: InsertTeamInvite): Promise<TeamInvite>;
  getUserTeamMember(userId: string): Promise<TeamMember | undefined>;
  getTeamMember(teamId: string, userId: string): Promise<TeamMember | undefined>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
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

  async getTeamShoots(teamId: string): Promise<Shoot[]> {
    return db
      .select()
      .from(shoots)
      .where(eq(shoots.teamId, teamId))
      .orderBy(desc(shoots.createdAt));
  }

  async getTeamShoot(id: string, teamId: string): Promise<Shoot | undefined> {
    const [shoot] = await db
      .select()
      .from(shoots)
      .where(and(eq(shoots.id, id), eq(shoots.teamId, teamId)));
    return shoot;
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

  async updateTeamShoot(id: string, teamId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined> {
    const { userId: _, teamId: __, ...allowedUpdates } = shoot as any;
    const [updated] = await db
      .update(shoots)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(shoots.id, id), eq(shoots.teamId, teamId)))
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

  async deleteTeamShoot(id: string, teamId: string): Promise<boolean> {
    const result = await db
      .delete(shoots)
      .where(and(eq(shoots.id, id), eq(shoots.teamId, teamId)))
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

  async deleteShootParticipants(shootId: string): Promise<void> {
    await db.delete(shootParticipants).where(eq(shootParticipants.shootId, shootId));
  }

  // Shoot Resource Association methods
  async getShootEquipment(shootId: string): Promise<Equipment[]> {
    const results = await db
      .select({ equipment: equipment })
      .from(shootEquipment)
      .innerJoin(equipment, eq(shootEquipment.equipmentId, equipment.id))
      .where(eq(shootEquipment.shootId, shootId));
    return results.map(r => r.equipment);
  }

  async getShootProps(shootId: string): Promise<Prop[]> {
    const results = await db
      .select({ prop: props })
      .from(shootProps)
      .innerJoin(props, eq(shootProps.propId, props.id))
      .where(eq(shootProps.shootId, shootId));
    return results.map(r => r.prop);
  }

  async getShootCostumes(shootId: string): Promise<CostumeProgress[]> {
    const results = await db
      .select({ costume: costumeProgress })
      .from(shootCostumes)
      .innerJoin(costumeProgress, eq(shootCostumes.costumeId, costumeProgress.id))
      .where(eq(shootCostumes.shootId, shootId));
    return results.map(r => r.costume);
  }

  async createShootEquipment(association: InsertShootEquipment): Promise<ShootEquipment> {
    const [newAssociation] = await db.insert(shootEquipment).values(association).returning();
    return newAssociation;
  }

  async createShootProp(association: InsertShootProp): Promise<ShootProp> {
    const [newAssociation] = await db.insert(shootProps).values(association).returning();
    return newAssociation;
  }

  async createShootCostume(association: InsertShootCostume): Promise<ShootCostume> {
    const [newAssociation] = await db.insert(shootCostumes).values(association).returning();
    return newAssociation;
  }

  async deleteShootEquipment(shootId: string): Promise<void> {
    await db.delete(shootEquipment).where(eq(shootEquipment.shootId, shootId));
  }

  async deleteShootProps(shootId: string): Promise<void> {
    await db.delete(shootProps).where(eq(shootProps.shootId, shootId));
  }

  async deleteShootCostumes(shootId: string): Promise<void> {
    await db.delete(shootCostumes).where(eq(shootCostumes.shootId, shootId));
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

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const { id: _, userId: __, ...allowedUpdates } = profile as any;
    const [updated] = await db
      .update(userProfiles)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Team Invite methods
  async getTeamInviteByCode(inviteCode: string): Promise<TeamInvite | undefined> {
    const [invite] = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.inviteCode, inviteCode));
    return invite;
  }

  async getUserTeamMember(userId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId))
      .limit(1);
    return member;
  }

  async getTeamMember(teamId: string, userId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return member;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning();
    return result.length > 0;
  }

  async getTeamInviteByTeamId(teamId: string): Promise<TeamInvite | undefined> {
    const [invite] = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.teamId, teamId));
    return invite;
  }

  async createTeamInvite(invite: InsertTeamInvite): Promise<TeamInvite> {
    const [newInvite] = await db.insert(teamInvites).values(invite).returning();
    return newInvite;
  }
}

export const storage = new DatabaseStorage();
