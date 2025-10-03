import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  activeTeamId: varchar("active_team_id").references(() => teams.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const teamInvites = pgTable("team_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  inviteCode: text("invite_code").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const personnel = pgTable("personnel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description"),
  quantity: integer("quantity").default(1),
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  placeId: text("place_id"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const props = pgTable("props", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const costumeProgress = pgTable("costume_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  characterName: text("character_name").notNull(),
  seriesName: text("series_name"),
  status: text("status").notNull().default("planning"),
  completionPercentage: integer("completion_percentage").default(0),
  todos: text("todos").array(),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const shoots = pgTable("shoots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("idea"),
  isPublic: boolean("is_public").default(false),
  date: timestamp("date"),
  time: text("time"),
  durationMinutes: integer("duration_minutes"),
  reminderTime: timestamp("reminder_time"),
  locationId: varchar("location_id").references(() => locations.id),
  locationNotes: text("location_notes"),
  description: text("description"),
  color: text("color"),
  instagramLinks: text("instagram_links").array(),
  calendarEventId: text("calendar_event_id"),
  calendarEventUrl: text("calendar_event_url"),
  docsUrl: text("docs_url"),
  docsId: text("docs_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const oauthTokens = pgTable("oauth_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(),
  accessTokenEncrypted: text("access_token_encrypted"),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const shootReferences = pgTable("shoot_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const shootParticipants = pgTable("shoot_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  personnelId: varchar("personnel_id").references(() => personnel.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const shootEquipment = pgTable("shoot_equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  equipmentId: varchar("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const shootProps = pgTable("shoot_props", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  propId: varchar("prop_id").notNull().references(() => props.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const shootCostumes = pgTable("shoot_costumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  costumeId: varchar("costume_id").notNull().references(() => costumeProgress.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertTeamInviteSchema = createInsertSchema(teamInvites).omit({
  id: true,
  createdAt: true,
});

export const insertPersonnelSchema = createInsertSchema(personnel).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropSchema = createInsertSchema(props).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCostumeProgressSchema = createInsertSchema(costumeProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShootSchema = createInsertSchema(shoots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.union([z.date(), z.string(), z.null()]).optional().transform(val => {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
});

export const insertShootReferenceSchema = createInsertSchema(shootReferences).omit({
  id: true,
  createdAt: true,
});

export const insertOAuthTokenSchema = createInsertSchema(oauthTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShootParticipantSchema = createInsertSchema(shootParticipants).omit({
  id: true,
  createdAt: true,
});

export const insertShootEquipmentSchema = createInsertSchema(shootEquipment).omit({
  id: true,
  createdAt: true,
});

export const insertShootPropSchema = createInsertSchema(shootProps).omit({
  id: true,
  createdAt: true,
});

export const insertShootCostumeSchema = createInsertSchema(shootCostumes).omit({
  id: true,
  createdAt: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamInvite = z.infer<typeof insertTeamInviteSchema>;
export type TeamInvite = typeof teamInvites.$inferSelect;
export type InsertPersonnel = z.infer<typeof insertPersonnelSchema>;
export type Personnel = typeof personnel.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertProp = z.infer<typeof insertPropSchema>;
export type Prop = typeof props.$inferSelect;
export type InsertCostumeProgress = z.infer<typeof insertCostumeProgressSchema>;
export type CostumeProgress = typeof costumeProgress.$inferSelect;
export type InsertShoot = z.infer<typeof insertShootSchema>;
export type Shoot = typeof shoots.$inferSelect;
export type InsertShootReference = z.infer<typeof insertShootReferenceSchema>;
export type ShootReference = typeof shootReferences.$inferSelect;
export type InsertShootParticipant = z.infer<typeof insertShootParticipantSchema>;
export type ShootParticipant = typeof shootParticipants.$inferSelect;
export type InsertShootEquipment = z.infer<typeof insertShootEquipmentSchema>;
export type ShootEquipment = typeof shootEquipment.$inferSelect;
export type InsertShootProp = z.infer<typeof insertShootPropSchema>;
export type ShootProp = typeof shootProps.$inferSelect;
export type InsertShootCostume = z.infer<typeof insertShootCostumeSchema>;
export type ShootCostume = typeof shootCostumes.$inferSelect;
