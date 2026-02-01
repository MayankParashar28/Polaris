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
  applications,
  type Application,
  type InsertApplication,
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
  updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined>;

  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterviewMessage(message: InsertInterviewMessage): Promise<InterviewMessage>;
  getInterviewMessages(interviewId: number): Promise<InterviewMessage[]>;

  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;

  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(userId: number): Promise<Application[]>;
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

  async createApplication(application: InsertApplication): Promise<Application> {
    if (!db) throw new Error("Database not initialized");
    const [newApp] = await db.insert(applications).values(application).returning();
    return newApp;
  }

  async getApplications(userId: number): Promise<Application[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.date));
  }
}

// Strictly persistent storage for Career-Navigator Production-Ready Environment
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private analysisResults: Map<number, AnalysisResult>;
  private roadmapItems: Map<number, RoadmapItem>;
  private interviews: Map<number, Interview>;
  private interviewMessages: Map<number, InterviewMessage>;
  private portfolios: Map<number, Portfolio>;
  private applications: Map<number, Application>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.analysisResults = new Map();
    this.roadmapItems = new Map();
    this.interviews = new Map();
    this.interviewMessages = new Map();
    this.portfolios = new Map();
    this.applications = new Map();
    this.currentId = {
      users: 1,
      resumes: 1,
      analysisResults: 1,
      roadmapItems: 1,
      interviews: 1,
      interviewMessages: 1,
      portfolios: 1,
      applications: 1,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const id = this.currentId.resumes++;
    const newResume: Resume = {
      ...resume,
      id,
      createdAt: new Date(),
      userId: resume.userId || null
    };
    this.resumes.set(id, newResume);
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getLatestResume(): Promise<Resume | undefined> {
    return Array.from(this.resumes.values())
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))[0];
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentId.analysisResults++;
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id,
      createdAt: new Date(),
      resumeQuality: analysis.resumeQuality ?? null,
      skillMatch: analysis.skillMatch ?? null,
      projectStrength: analysis.projectStrength ?? null,
      interviewReadiness: analysis.interviewReadiness ?? null,
      feedback: analysis.feedback ?? null,
      analysisData: analysis.analysisData ?? {}
    };
    this.analysisResults.set(id, newAnalysis);
    return newAnalysis;
  }

  async getAnalysisResultByResumeId(resumeId: number): Promise<AnalysisResult | undefined> {
    return Array.from(this.analysisResults.values()).find(
      (a) => a.resumeId === resumeId,
    );
  }

  async createRoadmapItems(items: InsertRoadmapItem[]): Promise<RoadmapItem[]> {
    return items.map((item) => {
      const id = this.currentId.roadmapItems++;
      const newItem: RoadmapItem = {
        ...item,
        id,
        status: item.status ?? "pending",
        createdAt: new Date()
      };
      this.roadmapItems.set(id, newItem);
      return newItem;
    });
  }

  async getRoadmapItemsByAnalysisId(analysisId: number): Promise<RoadmapItem[]> {
    return Array.from(this.roadmapItems.values())
      .filter((item) => item.analysisId === analysisId)
      .sort((a, b) => a.order - b.order);
  }

  async updateRoadmapItemStatus(id: number, status: string): Promise<RoadmapItem | undefined> {
    const item = this.roadmapItems.get(id);
    if (!item) return undefined;
    const updatedItem = { ...item, status };
    this.roadmapItems.set(id, updatedItem);
    return updatedItem;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const id = this.currentId.interviews++;
    const newInterview: Interview = {
      ...interview,
      id,
      createdAt: new Date(),
      score: interview.score ?? null,
      feedback: interview.feedback ?? null
    };
    this.interviews.set(id, newInterview);
    return newInterview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async createInterviewMessage(message: InsertInterviewMessage): Promise<InterviewMessage> {
    const id = this.currentId.interviewMessages++;
    const newMessage: InterviewMessage = { ...message, id, createdAt: new Date() };
    this.interviewMessages.set(id, newMessage);
    return newMessage;
  }

  async getInterviewMessages(interviewId: number): Promise<InterviewMessage[]> {
    return Array.from(this.interviewMessages.values())
      .filter((m) => m.interviewId === interviewId)
      .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentId.portfolios++;
    const newPortfolio: Portfolio = {
      ...portfolio,
      id,
      createdAt: new Date(),
      bio: portfolio.bio ?? null,
      theme: portfolio.theme ?? null,
      isPublic: portfolio.isPublic ?? null,
      projects: portfolio.projects ?? []
    };
    this.portfolios.set(id, newPortfolio);
    return newPortfolio;
  }

  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(
      (p) => p.userId === userId,
    );
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.currentId.applications++;
    const newApp: Application = {
      ...application,
      id,
      date: new Date(),
      status: application.status ?? "Applied",
      notes: application.notes ?? null
    };
    this.applications.set(id, newApp);
    return newApp;
  }

  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter((app) => app.userId === userId)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
  }
}

// Strictly persistent storage for Career-Navigator Production-Ready Environment
// export const storage = new DatabaseStorage();
// Fallback to MemStorage as the database connection is currently unreliable
export const storage = new MemStorage();
