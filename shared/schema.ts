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
  readinessScore: integer("readiness_score").notNull(),
  atsScore: integer("ats_score").notNull(),
  // New granular scores
  resumeQuality: integer("resume_quality").default(0),
  skillMatch: integer("skill_match").default(0),
  projectStrength: integer("project_strength").default(0),
  interviewReadiness: integer("interview_readiness").default(0),
  // Flexible AI Data
  feedback: text("feedback").default(""),
  analysisData: jsonb("analysis_data").default({}),
  rewrittenContent: text("rewritten_content").notNull(),
  strengths: text("strengths").array().notNull(),
  gaps: text("gaps").array().notNull(),
  // [FUTURE] embedding: vector("embedding", { dimensions: 1536 }), 
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

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull().references(() => resumes.id),
  userId: integer("user_id").notNull().references(() => users.id),
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviewMessages = pgTable("interview_messages", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull().references(() => interviews.id),
  role: text("role").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domain: text("domain").notNull().unique(), // e.g., "mayank" -> mayank.career-nav.com
  bio: text("bio"),
  projects: jsonb("projects").default([]), // Array of { title, desc, link, techStack }
  theme: text("theme").default("minimal"), // 'minimal', 'glass', 'brutalist'
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});


export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("Applied"), // 'Applied', 'Interview', 'Offer', 'Rejected'
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
});

// === RELATIONS ===

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

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

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  resume: one(resumes, {
    fields: [interviews.resumeId],
    references: [resumes.id],
  }),
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  messages: many(interviewMessages),
}));

export const interviewMessagesRelations = relations(interviewMessages, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewMessages.interviewId],
    references: [interviews.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  // applications: many(applications) // Optional: link applications to portfolio if needed later
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export const insertAnalysisSchema = createInsertSchema(analysisResults).omit({ id: true, createdAt: true });
export const insertRoadmapItemSchema = createInsertSchema(roadmapItems).omit({ id: true, createdAt: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true });
export const insertInterviewMessageSchema = createInsertSchema(interviewMessages).omit({ id: true, createdAt: true });
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, date: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisSchema>;

export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type InsertRoadmapItem = z.infer<typeof insertRoadmapItemSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type InterviewMessage = typeof interviewMessages.$inferSelect;
export type InsertInterviewMessage = z.infer<typeof insertInterviewMessageSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

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
