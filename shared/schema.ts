import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shoots = pgTable("shoots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("idea"),
  date: timestamp("date"),
  location: text("location"),
  description: text("description"),
  instagramLinks: text("instagram_links").array(),
  calendarEventId: text("calendar_event_id"),
  calendarEventUrl: text("calendar_event_url"),
  docsUrl: text("docs_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const shootReferences = pgTable("shoot_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const shootParticipants = pgTable("shoot_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
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

export const insertShootParticipantSchema = createInsertSchema(shootParticipants).omit({
  id: true,
  createdAt: true,
});

export type InsertShoot = z.infer<typeof insertShootSchema>;
export type Shoot = typeof shoots.$inferSelect;
export type InsertShootReference = z.infer<typeof insertShootReferenceSchema>;
export type ShootReference = typeof shootReferences.$inferSelect;
export type InsertShootParticipant = z.infer<typeof insertShootParticipantSchema>;
export type ShootParticipant = typeof shootParticipants.$inferSelect;
