import { db } from "./db";
import {
  users,
  resumes,
  analysisResults,
  roadmapItems,
  type User,
  type InsertUser,
  type Resume,
  type InsertResume,
  type AnalysisResult,
  type InsertAnalysisResult,
  type RoadmapItem,
  type InsertRoadmapItem,
  type Interview,
  type InsertInterview,
  type InterviewMessage,
  type InsertInterviewMessage,
  interviews,
  interviewMessages,
  portfolios,
  type Portfolio,
  type InsertPortfolio,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getLatestResume(): Promise<Resume | undefined>;

  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResultByResumeId(resumeId: number): Promise<AnalysisResult | undefined>;

  createRoadmapItems(items: InsertRoadmapItem[]): Promise<RoadmapItem[]>;
  getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]>;
  getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]>;
  updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined>;

  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterviewMessage(message: InsertInterviewMessage): Promise<InterviewMessage>;
  getInterviewMessages(interviewId: number): Promise<InterviewMessage[]>;

  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    if (!db) throw new Error("Database not initialized");
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async getLatestResume(): Promise<Resume | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [resume] = await db.select().from(resumes).orderBy(desc(resumes.createdAt)).limit(1);
    return resume;
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db.insert(analysisResults).values(analysis).returning();
    return result;
  }

  async getAnalysisResultByResumeId(resumeId: number): Promise<AnalysisResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.resumeId, resumeId));
    return result;
  }

  async createRoadmapItems(items: InsertRoadmapItem[]): Promise<RoadmapItem[]> {
    if (!db) throw new Error("Database not initialized");
    if (items.length === 0) return [];
    return await db.insert(roadmapItems).values(items).returning();
  }

  async getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]> {
    if (!db) throw new Error("Database not initialized");
    return await db
      .select()
      .from(roadmapItems)
      .where(eq(roadmapItems.analysisId, analysisId))
      .orderBy(roadmapItems.order);
  }

  async updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [item] = await db
      .update(roadmapItems)
      .set({ status })
      .where(eq(roadmapItems.id, id))
      .returning();
    return item;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    if (!db) throw new Error("Database not initialized");
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async createInterviewMessage(message: InsertInterviewMessage): Promise<InterviewMessage> {
    if (!db) throw new Error("Database not initialized");
    const [newMessage] = await db.insert(interviewMessages).values(message).returning();
    return newMessage;
  }

  async getInterviewMessages(interviewId: number): Promise<InterviewMessage[]> {
    if (!db) throw new Error("Database not initialized");
    return await db
      .select()
      .from(interviewMessages)
      .where(eq(interviewMessages.interviewId, interviewId))
      .orderBy(interviewMessages.createdAt);
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    if (!db) throw new Error("Database not initialized");
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    return portfolio;
  }
}

// Strictly persistent storage for Career-Navigator Production-Ready Environment
export const storage = new DatabaseStorage();
