import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional for now as per "without forcing early sign-up"
  content: text("content").notNull(), // Extracted text
  targetRole: text("target_role").notNull(),
  fileName: text("file_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull().references(() => resumes.id),
  readinessScore: integer("readiness_score").notNull(), // 0-100
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  gaps: jsonb("gaps").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roadmapItems = pgTable("roadmap_items", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull().references(() => analysisResults.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'skill', 'project', 'practice', 'interview'
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed'
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const resumesRelations = relations(resumes, ({ one }) => ({
  analysisResult: one(analysisResults, {
    fields: [resumes.id],
    references: [analysisResults.resumeId],
  }),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one, many }) => ({
  resume: one(resumes, {
    fields: [analysisResults.resumeId],
    references: [resumes.id],
  }),
  roadmapItems: many(roadmapItems),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({ one }) => ({
  analysisResult: one(analysisResults, {
    fields: [roadmapItems.analysisId],
    references: [analysisResults.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export const insertAnalysisSchema = createInsertSchema(analysisResults).omit({ id: true, createdAt: true });
export const insertRoadmapItemSchema = createInsertSchema(roadmapItems).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisSchema>;

export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type InsertRoadmapItem = z.infer<typeof insertRoadmapItemSchema>;

export type CreateResumeRequest = {
  content: string;
  targetRole: string;
  fileName: string;
};

export type AnalysisResponse = AnalysisResult & {
  roadmap: RoadmapItem[];
};

export type UpdateRoadmapStatusRequest = {
  status: "pending" | "in_progress" | "completed";
};
