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
import { supabaseAdmin } from "./supabase";

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
  updateShootReference(id: string, updates: Partial<InsertShootReference>): Promise<ShootReference | undefined>;
  
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
  getUserTeams(userId: string): Promise<any[]>;
  setActiveTeam(userId: string, teamId: string): Promise<UserProfile | undefined>;
  ensureUserTeam(userId: string, userEmail: string): Promise<{ teamId: string; created: boolean }>;

  // OAuth tokens
  getOAuthToken(userId: string, provider: string): Promise<any | undefined>;
  upsertOAuthToken(userId: string, provider: string, tokenData: any): Promise<void>;
  deleteOAuthToken(userId: string, provider: string): Promise<void>;

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

// Helper function to convert camelCase to snake_case for Supabase
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const snakeCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseObj[snakeKey] = value;
  }
  return snakeCaseObj;
}

// Helper function to convert snake_case to camelCase from Supabase
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = toCamelCase(value);
  }
  return camelCaseObj;
}

export class SupabaseStorage implements IStorage {
  async getShoot(id: string, userId: string): Promise<Shoot | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Shoot;
  }

  async getUserShoots(userId: string): Promise<Shoot[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error} = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Shoot[];
  }

  async getTeamShoots(teamId: string): Promise<Shoot[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Shoot[];
  }

  async getTeamShoot(id: string, teamId: string): Promise<Shoot | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Shoot;
  }

  async createShoot(shoot: InsertShoot): Promise<Shoot> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .insert(toSnakeCase(shoot))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot: ${error.message}`);
    return toCamelCase(data) as Shoot;
  }

  async updateShoot(id: string, userId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { userId: _, ...allowedUpdates } = shoot as any;
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .update(toSnakeCase({ ...allowedUpdates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Shoot;
  }

  async updateTeamShoot(id: string, teamId: string, shoot: Partial<InsertShoot>): Promise<Shoot | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { userId: _, teamId: __, ...allowedUpdates } = shoot as any;
    const { data, error } = await supabaseAdmin
      .from('shoots')
      .update(toSnakeCase({ ...allowedUpdates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Shoot;
  }

  async deleteShoot(id: string, userId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoots')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    return !error;
  }

  async deleteTeamShoot(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoots')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getShootReferences(shootId: string): Promise<ShootReference[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .select()
      .eq('shoot_id', shootId);
    
    if (error) return [];
    return (data || []).map(toCamelCase) as ShootReference[];
  }

  async getShootReferenceById(id: string): Promise<ShootReference | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .select()
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as ShootReference;
  }

  async createShootReference(reference: InsertShootReference): Promise<ShootReference> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .insert(toSnakeCase(reference))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot reference: ${error.message}`);
    return toCamelCase(data) as ShootReference;
  }

  async deleteShootReference(id: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_references')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async updateShootReference(id: string, updates: Partial<InsertShootReference>): Promise<ShootReference | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");

    const { data, error } = await supabaseAdmin
      .from('shoot_references')
      .update(toSnakeCase({ ...updates, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return toCamelCase(data) as ShootReference;
  }

  async getShootParticipants(shootId: string): Promise<ShootParticipant[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_participants')
      .select()
      .eq('shoot_id', shootId);
    
    if (error) return [];
    return (data || []).map(toCamelCase) as ShootParticipant[];
  }

  async getShootParticipantById(id: string): Promise<ShootParticipant | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_participants')
      .select()
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as ShootParticipant;
  }

  async createShootParticipant(participant: InsertShootParticipant): Promise<ShootParticipant> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_participants')
      .insert(toSnakeCase(participant))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot participant: ${error.message}`);
    return toCamelCase(data) as ShootParticipant;
  }

  async deleteShootParticipant(id: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_participants')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getShootEquipment(shootId: string): Promise<Equipment[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_equipment')
      .select('*, equipment:equipment_id(*)')
      .eq('shoot_id', shootId);
    
    if (error) return [];
    return (data || []).map(row => toCamelCase((row as any).equipment)).filter(Boolean) as Equipment[];
  }

  async getShootProps(shootId: string): Promise<Prop[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_props')
      .select('*, prop:prop_id(*)')
      .eq('shoot_id', shootId);
    
    if (error) return [];
    return (data || []).map(row => toCamelCase((row as any).prop)).filter(Boolean) as Prop[];
  }

  async getShootCostumes(shootId: string): Promise<CostumeProgress[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_costumes')
      .select('*, costume:costume_id(*)')
      .eq('shoot_id', shootId);
    
    if (error) return [];
    return (data || []).map(row => toCamelCase((row as any).costume)).filter(Boolean) as CostumeProgress[];
  }

  async createShootEquipment(association: InsertShootEquipment): Promise<ShootEquipment> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_equipment')
      .insert(toSnakeCase(association))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot equipment association: ${error.message}`);
    return toCamelCase(data) as ShootEquipment;
  }

  async createShootProp(association: InsertShootProp): Promise<ShootProp> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_props')
      .insert(toSnakeCase(association))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot prop association: ${error.message}`);
    return toCamelCase(data) as ShootProp;
  }

  async createShootCostume(association: InsertShootCostume): Promise<ShootCostume> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('shoot_costumes')
      .insert(toSnakeCase(association))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create shoot costume association: ${error.message}`);
    return toCamelCase(data) as ShootCostume;
  }

  async getPersonnel(id: string, teamId: string): Promise<Personnel | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Personnel;
  }

  async getTeamPersonnel(teamId: string): Promise<Personnel[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Personnel[];
  }

  async createPersonnel(person: InsertPersonnel): Promise<Personnel> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .insert(toSnakeCase(person))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create personnel: ${error.message}`);
    return toCamelCase(data) as Personnel;
  }

  async updatePersonnel(id: string, teamId: string, person: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('personnel')
      .update(toSnakeCase({ ...person, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Personnel;
  }

  async deletePersonnel(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('personnel')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getEquipment(id: string, teamId: string): Promise<Equipment | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Equipment;
  }

  async getTeamEquipment(teamId: string): Promise<Equipment[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Equipment[];
  }

  async createEquipment(item: InsertEquipment): Promise<Equipment> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .insert(toSnakeCase(item))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create equipment: ${error.message}`);
    return toCamelCase(data) as Equipment;
  }

  async updateEquipment(id: string, teamId: string, item: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('equipment')
      .update(toSnakeCase({ ...item, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Equipment;
  }

  async deleteEquipment(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('equipment')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getLocation(id: string, teamId: string): Promise<Location | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Location;
  }

  async getTeamLocations(teamId: string): Promise<Location[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Location[];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .insert(toSnakeCase(location))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create location: ${error.message}`);
    return toCamelCase(data) as Location;
  }

  async updateLocation(id: string, teamId: string, location: Partial<InsertLocation>): Promise<Location | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .update(toSnakeCase({ ...location, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Location;
  }

  async deleteLocation(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getProp(id: string, teamId: string): Promise<Prop | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('props')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Prop;
  }

  async getTeamProps(teamId: string): Promise<Prop[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('props')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as Prop[];
  }

  async createProp(prop: InsertProp): Promise<Prop> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('props')
      .insert(toSnakeCase(prop))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create prop: ${error.message}`);
    return toCamelCase(data) as Prop;
  }

  async updateProp(id: string, teamId: string, prop: Partial<InsertProp>): Promise<Prop | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('props')
      .update(toSnakeCase({ ...prop, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Prop;
  }

  async deleteProp(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('props')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getCostumeProgress(id: string, teamId: string): Promise<CostumeProgress | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('costume_progress')
      .select()
      .eq('id', id)
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as CostumeProgress;
  }

  async getTeamCostumes(teamId: string): Promise<CostumeProgress[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('costume_progress')
      .select()
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(toCamelCase) as CostumeProgress[];
  }

  async createCostumeProgress(costume: InsertCostumeProgress): Promise<CostumeProgress> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('costume_progress')
      .insert(toSnakeCase(costume))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create costume progress: ${error.message}`);
    return toCamelCase(data) as CostumeProgress;
  }

  async updateCostumeProgress(id: string, teamId: string, costume: Partial<InsertCostumeProgress>): Promise<CostumeProgress | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('costume_progress')
      .update(toSnakeCase({ ...costume, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as CostumeProgress;
  }

  async deleteCostumeProgress(id: string, teamId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('costume_progress')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);
    
    return !error;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select()
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('teams')
      .insert(toSnakeCase(team))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create team: ${error.message}`);
    return toCamelCase(data) as Team;
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(toSnakeCase({ ...team, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as Team;
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select()
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as UserProfile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert(toSnakeCase(profile))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return toCamelCase(data) as UserProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(toSnakeCase({ ...profile, updated_at: new Date().toISOString() }))
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as UserProfile;
  }

  async getUserTeams(userId: string): Promise<any[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*, team:team_id(*)')
      .eq('user_id', userId);
    
    if (error) return [];
    return (data || []).map(row => toCamelCase((row as any).team)).filter(Boolean);
  }

  async setActiveTeam(userId: string, teamId: string): Promise<UserProfile | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ active_team_id: teamId, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as UserProfile;
  }

  async ensureUserTeam(userId: string, userEmail: string): Promise<{ teamId: string; created: boolean }> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select()
      .eq('user_id', userId)
      .single();

    if (profile && (profile as any).active_team_id) {
      const teamMember = await this.getTeamMember((profile as any).active_team_id, userId);
      if (teamMember) {
        return { teamId: (profile as any).active_team_id, created: false };
      }
    }

    const { data: userTeams } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .limit(1);

    if (userTeams && userTeams.length > 0) {
      const teamId = userTeams[0].team_id;
      await this.setActiveTeam(userId, teamId);
      return { teamId, created: false };
    }

    const teamName = userEmail.split('@')[0] + "'s Team";
    const team = await this.createTeam({ name: teamName });
    
    await this.createTeamMember({
      userId,
      teamId: team.id,
      role: 'owner',
    });

    if (!profile) {
      await this.createUserProfile({
        userId,
        activeTeamId: team.id,
      });
    } else {
      await this.setActiveTeam(userId, team.id);
    }

    return { teamId: team.id, created: true };
  }

  async getOAuthToken(userId: string, provider: string): Promise<any | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('oauth_tokens')
      .select()
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data);
  }

  async upsertOAuthToken(userId: string, provider: string, tokenData: any): Promise<void> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('oauth_tokens')
      .upsert(toSnakeCase({
        userId,
        provider,
        ...tokenData,
        updatedAt: new Date().toISOString(),
      }), {
        onConflict: 'user_id,provider'
      });
    
    if (error) throw new Error(`Failed to upsert OAuth token: ${error.message}`);
  }

  async deleteOAuthToken(userId: string, provider: string): Promise<void> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    await supabaseAdmin
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);
  }

  async getTeamInviteByCode(inviteCode: string): Promise<TeamInvite | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .select()
      .eq('invite_code', inviteCode)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as TeamInvite;
  }

  async getTeamInviteByTeamId(teamId: string): Promise<TeamInvite | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .select()
      .eq('team_id', teamId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as TeamInvite;
  }

  async createTeamInvite(invite: InsertTeamInvite): Promise<TeamInvite> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .insert(toSnakeCase(invite))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create team invite: ${error.message}`);
    return toCamelCase(data) as TeamInvite;
  }

  async getUserTeamMember(userId: string): Promise<TeamMember | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select()
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as TeamMember;
  }

  async getTeamMember(teamId: string, userId: string): Promise<TeamMember | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select()
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as TeamMember;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select()
      .eq('team_id', teamId);
    
    if (error) return [];
    return (data || []).map(toCamelCase) as TeamMember[];
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(toSnakeCase(member))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create team member: ${error.message}`);
    return toCamelCase(data) as TeamMember;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return toCamelCase(data) as TeamMember;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async deleteShootEquipment(shootId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_equipment')
      .delete()
      .eq('shoot_id', shootId);
    
    return !error;
  }

  async deleteShootProps(shootId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_props')
      .delete()
      .eq('shoot_id', shootId);
    
    return !error;
  }

  async deleteShootCostumes(shootId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_costumes')
      .delete()
      .eq('shoot_id', shootId);
    
    return !error;
  }

  async deleteShootParticipants(shootId: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error("Supabase admin client not initialized");
    
    const { error } = await supabaseAdmin
      .from('shoot_participants')
      .delete()
      .eq('shoot_id', shootId);
    
    return !error;
  }
}

export const storage = new SupabaseStorage();
