import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Resume Analysis Endpoint
  app.post(api.resumes.analyze.path, async (req, res) => {
    try {
      const input = api.resumes.analyze.input.parse(req.body);

      // 1. Save Resume
      const resume = await storage.createResume({
        content: input.content,
        targetRole: input.targetRole,
        fileName: input.fileName,
      });

      // 2. Call OpenAI for Analysis
      const prompt = `
        You are an expert career coach and technical interviewer.
        Analyze the following resume content for the role of "${input.targetRole}".
        
        Resume Content:
        "${input.content}"

        Provide a JSON response with the following structure:
        {
          "readinessScore": number (0-100),
          "strengths": string[] (3-5 key strengths),
          "gaps": string[] (3-5 missing skills or areas for improvement),
          "roadmap": [
            {
              "title": string,
              "description": string,
              "category": "skill" | "project" | "practice",
              "order": number (1-based index)
            }
          ]
        }
        
        The roadmap should contain 4-6 actionable steps sorted by priority (order).
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are a helpful assistant that outputs JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from OpenAI");
      }

      const analysisData = JSON.parse(content);

      // 3. Save Analysis Results
      const analysis = await storage.createAnalysisResult({
        resumeId: resume.id,
        readinessScore: analysisData.readinessScore,
        strengths: analysisData.strengths,
        gaps: analysisData.gaps,
      });

      // 4. Save Roadmap Items
      const roadmapItemsData = analysisData.roadmap.map((item: any) => ({
        analysisId: analysis.id,
        title: item.title,
        description: item.description,
        category: item.category,
        order: item.order,
        status: "pending",
      }));

      await storage.createRoadmapItems(roadmapItemsData);

      // 5. Return IDs
      res.status(201).json({
        resumeId: resume.id,
        analysisId: analysis.id,
      });

    } catch (err) {
      console.error("Analysis error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error during analysis" });
    }
  });

  // Get Analysis with Roadmap Endpoint
  app.get(api.resumes.getAnalysis.path, async (req, res) => {
    try {
      const resumeId = Number(req.params.id);
      const analysis = await storage.getAnalysisResultByResumeId(resumeId);

      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      const roadmap = await storage.getRoadmapItemsByAnalysisId(analysis.id);

      res.json({
        ...analysis,
        roadmap,
      });
    } catch (err) {
      console.error("Get analysis error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update Roadmap Item Status Endpoint
  app.patch(api.roadmap.updateStatus.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = api.roadmap.updateStatus.input.parse(req.body);

      const updatedItem = await storage.updateRoadmapItemStatus(id, status);

      if (!updatedItem) {
        return res.status(404).json({ message: "Roadmap item not found" });
      }

      res.json(updatedItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
