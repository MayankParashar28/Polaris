import { z } from 'zod';
import { insertResumeSchema, analysisResults, roadmapItems, resumes } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  resumes: {
    analyze: {
      method: 'POST' as const,
      path: '/api/resumes/analyze',
      input: z.object({
        content: z.string(),
        targetRole: z.string(),
        fileName: z.string(),
      }),
      responses: {
        201: z.object({
          resumeId: z.number(),
          analysisId: z.number(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    getAnalysis: {
      method: 'GET' as const,
      path: '/api/resumes/:id/analysis',
      responses: {
        200: z.custom<typeof analysisResults.$inferSelect & { roadmap: typeof roadmapItems.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  roadmap: {
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/roadmap/:id/status',
      input: z.object({
        status: z.enum(["pending", "in_progress", "completed"]),
      }),
      responses: {
        200: z.custom<typeof roadmapItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type AnalyzeResumeInput = z.infer<typeof api.resumes.analyze.input>;
export type AnalyzeResumeResponse = z.infer<typeof api.resumes.analyze.responses[201]>;
export type AnalysisDataResponse = z.infer<typeof api.resumes.getAnalysis.responses[200]>;
export type UpdateRoadmapStatusInput = z.infer<typeof api.roadmap.updateStatus.input>;
