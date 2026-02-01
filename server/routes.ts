import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from "json5";
import multer from "multer";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

// Initialize multiple Gemini clients for redundancy
const genAIPrimary = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const genAISandbox = process.env.GEMINI_API_KEY_LIGHT ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY_LIGHT) : null;


// Multer setup for memory storage (for passing to Supabase)
const upload = multer({ storage: multer.memoryStorage() });

// Helper to try multiple models & multiple keys with fallback
// Helper to try multiple models & multiple keys with fallback
// Supports textual prompts and multimodal input (images/PDFs)
async function generateContentWithFallback(prompt: string, jsonMode = true, inlineData?: { mimeType: string; data: string } | null) {
  const clients = [genAIPrimary, genAISandbox].filter(Boolean);
  if (clients.length === 0) throw new Error("No Gemini API Keys found");

  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro"
  ];

  const errors: any[] = [];

  for (const client of clients) {
    for (const modelName of models) {
      try {


        const model = client!.getGenerativeModel({ model: modelName });

        const config: any = {};
        if (jsonMode) {
          config.responseMimeType = "application/json";
        }

        const parts: any[] = [{ text: prompt }];
        if (inlineData) {
          parts.push({ inlineData });
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: parts }],
          generationConfig: config
        });

        return result;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed on current key:`, err.message || err);
        errors.push({ model: modelName, error: err.message || err });
      }
    }
  }

  throw new Error(JSON.stringify(errors));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Resume Analysis Endpoint
  // Resume Analysis Endpoint - PUBLIC
  app.post(api.resumes.analyze.path, upload.single("file"), async (req, res) => {
    if (!genAIPrimary && !genAISandbox) {

      return res.status(500).json({
        message: "Gemini API Keys are missing. Please add GEMINI_API_KEY to your .env file."
      });
    }

    try {
      const { content, targetRole, fileName } = req.body;
      const file = req.file;
      let fileUrl = null;

      // 1. Upload to Supabase Storage if available
      if (file && isSupabaseConfigured()) {
        const fileExt = fileName.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase!.storage
          .from('resumes')
          .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          console.error("Supabase Storage Error:", error);
        } else if (data) {
          fileUrl = data.path;
        }
      }

      // 2. Save Resume (User ID is optional)
      const resume = await storage.createResume({
        content: content,
        targetRole: targetRole,
        fileName: fileName,
        userId: req.user?.id || null,
      });


      // 2. Call Gemini for Analysis (with fallback)
      const prompt = `
        You are an expert career coach, ATS algorithm specialist, and technical recruiter.
        
        **STRICT RULES - READ CAREFULLY:**
        1.  **NO HALLUCINATIONS:** You MUST use the candidate's actual work history (dates, companies, roles) EXACTLY as provided. DO NOT invent new companies or dates.
        2.  **EXTREME BREVITY (ONE PAGE LIMIT):** The user demands a 1-page resume. You MUST be concise.
            - **Limit bullet points:** Max 3-4 bullet points per recent role. Max 2 for older roles.
            - **Omit older roles:** If the history is long, summarize or omit roles older than 10 years unless critical.
            - **No fluff:** Remove adjectives and filler words.
        3.  **IMPACT-DRIVEN:** Rewrite bullet points using the "Action - Context - Result" format. (e.g., instead of "Worked on API", say "Engineered scalable REST APIs using Node.js, reducing latency by 40%").
        4.  **INDUSTRY STANDARD:** Use clean, professional Markdown. Use professional headers (#, ##).
        5.  **SKILL INJECTION:** If the candidate lists a general skill (e.g., "React"), intelligently inject related industry-standard keywords (e.g., "Redux", "Hooks", "Virtual DOM", "Performance Optimization") into the descriptions *where they make sense contextually*.
        6.  **TELL THE USER:** You MUST return a list of these "Added Keywords" so we can show the user what high-impact skills you added.

        **Your Task:**
        1.  Analyze the resume for the role of "${targetRole}".
        2.  Assign scores (Readiness, ATS, etc.).
        3.  COMPLETELY REWRITE the resume in Markdown (Strictly < 450 words total).
        4.  Generate the list of added keywords.
        5.  Create a learning roadmap.

        Resume Content provided below (Text or Attachment).
        ${content ? `Text Extract: "${content.slice(0, 1000)}..."` : "No text extracted. Please analyze the attached PDF file."}

        Provide a JSON response with the following structure:
        {
          "readinessScore": number, // Overall 0-100
          "atsScore": number, // 0-100
          "resumeQuality": number, // 0-100
          "skillMatch": number, // 0-100
          "projectStrength": number, // 0-100
          "interviewReadiness": number, // 0-100
          "feedback": "string", // Specific feedback
          "rewrittenContent": "markdown string",
          "strengths": string[],
          "gaps": string[],
          "addedKeywords": string[], // List of high-impact keywords you injected
          "roadmap": [
            {
              "title": string,
              "description": string,
              "category": "skill" | "project" | "practice" | "interview",
              "order": number
            }
          ]
        }
        
        The roadmap should contain 6-8 actionable steps.
        IMPORTANT: Return ONLY the JSON object.
      `;

      let inlineData = null;
      if (file) {
        inlineData = {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64")
        };
      }

      const result = await generateContentWithFallback(prompt, true, inlineData);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if the model adds them
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      let analysisData;
      try {
        // Use JSON5 for more lenient parsing
        analysisData = JSON5.parse(text);
      } catch (parseError) {
        console.error("JSON5 Parse Error:", parseError);
        console.log("Attempting regex cleanup...");
        try {
          // Fix common AI JSON issues
          const fixed = text
            .replace(/\\_/g, "_")
            .replace(/(?<!\\)\n/g, "\\n");
          analysisData = JSON5.parse(fixed);
        } catch (e2) {
          console.error("Critical JSON Parse Error. Raw Text:", text);
          throw new Error("Failed to parse AI response. See server logs.");
        }
      }

      // 3. Save Analysis Results
      const analysis = await storage.createAnalysisResult({
        resumeId: resume.id,
        readinessScore: analysisData.readinessScore,
        atsScore: analysisData.atsScore,
        resumeQuality: analysisData.resumeQuality || 0,
        skillMatch: analysisData.skillMatch || 0,
        projectStrength: analysisData.projectStrength || 0,
        interviewReadiness: analysisData.interviewReadiness || 0,
        feedback: analysisData.feedback || "Analysis complete.",
        rewrittenContent: analysisData.rewrittenContent,
        analysisData: { addedKeywords: analysisData.addedKeywords || [] }, // Save added keywords here
        strengths: analysisData.strengths || [],
        gaps: analysisData.gaps || [],
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

    } catch (err: any) {
      console.error("Analysis error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }

      const status = err.status || 500;
      const message = status === 429
        ? "AI Rate Limit Exceeded. Please try again in 30 seconds."
        : "Internal server error during analysis";

      res.status(status).json({ message });
    }
  });

  // Intelligent Resume Scan Endpoint - PUBLIC
  app.post(api.resumes.scan.path, async (req, res) => {
    if (!genAIPrimary && !genAISandbox) {
      return res.status(500).json({ message: "Gemini API Key missing" });
    }

    try {
      const { content } = api.resumes.scan.input.parse(req.body);

      const prompt = `
        Drafting a resume.
        Identify the candidate's name.
        Infer the most suitable "Job Title" based on their experience.
        Extract top 5 technical skills.

        Resume Text:
        "${content.slice(0, 2000)}"

        Return JSON:
        {
          "candidateName": "string",
          "suggestedRole": "string",
          "skills": ["string"]
        }
      `;

      const result = await generateContentWithFallback(prompt, true);

      const responseText = result.response.text();
      const data = JSON5.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());

      res.json(data);
    } catch (err: any) {
      console.error("Scan error:", err);
      const status = err.status || 500;
      const message = status === 429
        ? "AI Rate Limit Exceeded. Please try again in 30 seconds."
        : `Failed to scan resume: ${err.message}`;
      res.status(status).json({ message, error: err });
    }
  });

  // Get Analysis with Roadmap Endpoint - PUBLIC
  app.get(api.resumes.getAnalysis.path, async (req, res) => {
    // Auth check removed
    // if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const resumeId = Number(req.params.id);

      // Verify ownership OR allow if public/anonymous context
      const resume = await storage.getResume(resumeId);

      // If resume exists but has a user, and request has no user or wrong user -> We might want to block?
      // But for "remove auth" request, we allow viewing created resumes.
      // We will allow if resume exists.
      if (!resume) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      const analysis = await storage.getAnalysisResultByResumeId(resumeId);

      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      const roadmap = await storage.getRoadmapItemsByAnalysisId(analysis.id);

      res.json({
        ...analysis,
        resume,
        roadmap,
      });
    } catch (err) {
      console.error("Get analysis error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Latest Analysis Endpoint
  app.get("/api/resumes/latest", async (req, res) => {
    try {
      const resume = await storage.getLatestResume();
      if (!resume) return res.status(404).json({ message: "No resumes found" });

      const analysis = await storage.getAnalysisResultByResumeId(resume.id);
      if (!analysis) return res.status(404).json({ message: "Analysis not found" });

      const roadmap = await storage.getRoadmapItemsByAnalysisId(analysis.id);

      res.json({ ...analysis, resume, roadmap });
    } catch (err) {
      console.error("Get latest analysis error:", err);
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

  // ==========================================
  // MOCK INTERVIEW ROUTES
  // ==========================================

  // Create Interview Session
  app.post(api.interviews.create.path, async (req, res) => {
    try {
      // In a real app, userId should come from req.user
      const { resumeId, userId } = api.interviews.create.input.parse(req.body);

      const interview = await storage.createInterview({
        resumeId,
        userId,
        score: null,
        feedback: null,
      });

      // Initialize with a welcome message from AI
      // We need to fetch the resume first to know the context
      const resume = await storage.getResume(resumeId);
      if (resume) {
        const welcomePrompt = `
          You are a professional technical interviewer.
          The candidate is applying for the role of "${resume.targetRole}".
          Start the interview by introducing yourself briefly and asking the first question based on their resume.
          Keep it professional but encouraging.
          Resume Context: ${resume.content.slice(0, 1000)}...
        `;

        const result = await generateContentWithFallback(welcomePrompt, false); // false = plain text
        const welcomeMessage = result.response.text();

        await storage.createInterviewMessage({
          interviewId: interview.id,
          role: "ai",
          content: welcomeMessage,
        });
      }

      res.status(201).json(interview);
    } catch (err: any) {
      console.error("Create interview error:", err);
      res.status(500).json({ message: "Failed to start interview" });
    }
  });

  // Get Interview Session
  app.get(api.interviews.get.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const interview = await storage.getInterview(id);

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      const messages = await storage.getInterviewMessages(id);

      res.json({
        ...interview,
        messages,
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send Message (Chat with AI)
  app.post(api.interviews.addMessage.path, async (req, res) => {
    if (!genAIPrimary && !genAISandbox) {
      return res.status(500).json({ message: "Gemini API Key missing" });
    }

    try {
      const id = Number(req.params.id);
      const { content } = api.interviews.addMessage.input.parse(req.body);

      // 1. Save User Message
      await storage.createInterviewMessage({
        interviewId: id,
        role: "user",
        content: content,
      });

      // 2. Fetch History & Context
      const interview = await storage.getInterview(id);
      if (!interview) return res.status(404).json({ message: "Interview not found" });

      const resume = await storage.getResume(interview.resumeId);
      const previousMessages = await storage.getInterviewMessages(id);

      // 3. Construct Prompt
      // We format previous messages as a chat logs
      const chatHistory = previousMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

      const systemContext = `
        You are a strict but fair technical interviewer.
        Candidate Target Role: ${resume?.targetRole}
        Resume Content: ${resume?.content.slice(0, 2000)}

        Your goal is to assess the candidate's skills.
        - Ask one question at a time.
        - If the user answers, evaluate it briefly (e.g., "Good point about X, but you missed Y") then ask the next question.
        - If the user says "I don't know", accept it and move to a different topic.
        - Keep responses concise (under 100 words).
      `;

      const prompt = `
        ${systemContext}

        Current Conversation History:
        ${chatHistory}

        User just said: "${content}"

        Reply as the Interviewer:
      `;

      // 4. Call AI
      const result = await generateContentWithFallback(prompt, false); // plain text
      const aiResponseText = result.response.text();

      // 5. Save AI Message
      const aiMessage = await storage.createInterviewMessage({
        interviewId: id,
        role: "ai",
        content: aiResponseText,
      });

      res.status(201).json(aiMessage);

    } catch (err) {
      console.error("Interview chat error:", err);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Seed data function
  async function seedDatabase() {
    const existingUser = await storage.getUserByUsername("demo");
    let userId = existingUser?.id;

    if (!existingUser) {
      const user = await storage.createUser({
        username: "demo",
        password: "password", // In a real app, hash this! This is just for seed.
      });
      userId = user.id;
    }

    const existing = await storage.getResume(1);
    if (!existing && userId) {
      const resume = await storage.createResume({
        content: "Experience: 5 years in React development. Skills: TypeScript, Node.js, AWS.",
        targetRole: "Senior Frontend Engineer",
        fileName: "example_resume.pdf",
        userId: userId,
      });
      const analysis = await storage.createAnalysisResult({
        resumeId: resume.id,
        readinessScore: 85,
        atsScore: 78,
        rewrittenContent: "# Resume\n\n- 5 years in React development\n- Expert in TypeScript and Node.js",
        strengths: ["Strong React background", "Cloud experience", "TypeScript proficiency"],
        gaps: ["Testing frameworks", "System design basics"],
      });
      await storage.createRoadmapItems([
        {
          analysisId: analysis.id,
          title: "Master Vitest",
          description: "Learn how to write unit tests for React components.",
          category: "skill",
          order: 1,
          status: "pending",
        },
        {
          analysisId: analysis.id,
          title: "Build a Scalable Architecture",
          description: "Practice building a multi-service app on AWS.",
          category: "project",
          order: 2,
          status: "pending",
        },
        {
          analysisId: analysis.id,
          title: "Behavioral Mock Interview",
          description: "Practice STAR method for leadership questions.",
          category: "interview",
          order: 3,
          status: "pending",
        }
      ]);
    }
  }

  seedDatabase().catch(console.error);

  return httpServer;
}
