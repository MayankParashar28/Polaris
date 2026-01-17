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
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;

  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResultByResumeId(resumeId: number): Promise<AnalysisResult | undefined>;

  createRoadmapItems(items: InsertRoadmapItem[]): Promise<RoadmapItem[]>;
  getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]>;
  updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db.insert(analysisResults).values(analysis).returning();
    return result;
  }

  async getAnalysisResultByResumeId(resumeId: number): Promise<AnalysisResult | undefined> {
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.resumeId, resumeId));
    return result;
  }

  async createRoadmapItems(items: InsertRoadmapItem[]): Promise<RoadmapItem[]> {
    if (items.length === 0) return [];
    return await db.insert(roadmapItems).values(items).returning();
  }

  async getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]> {
    return await db
      .select()
      .from(roadmapItems)
      .where(eq(roadmapItems.analysisId, analysisId))
      .orderBy(roadmapItems.order);
  }

  async updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined> {
    const [item] = await db
      .update(roadmapItems)
      .set({ status })
      .where(eq(roadmapItems.id, id))
      .returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
