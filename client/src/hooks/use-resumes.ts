import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AnalyzeResumeInput, type UpdateRoadmapStatusInput } from "@shared/routes";

// ============================================
// RESUME & ANALYSIS HOOKS
// ============================================

export function useAnalyzeResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(api.resumes.analyze.path, {
        method: api.resumes.analyze.method,
        // Content-Type is intentionally omitted for FormData to let the browser set it with the boundary
        body: data,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
      }

      return api.resumes.analyze.responses[201].parse(await res.json());
    },
    // No invalidation needed as this creates a new resource we navigate to
  });
}

export function useResumeAnalysis(id: number | "latest") {
  return useQuery({
    queryKey: [api.resumes.getAnalysis.path, id],
    queryFn: async () => {
      // Handle the 'latest' case or normal numeric ID
      const url = id === "latest"
        ? "/api/resumes/latest"
        : buildUrl(api.resumes.getAnalysis.path, { id });

      const res = await fetch(url);

      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis");

      // We reuse the schema for parsing
      return api.resumes.getAnalysis.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// ============================================
// ROADMAP HOOKS
// ============================================

export function useUpdateRoadmapStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & UpdateRoadmapStatusInput) => {
      const url = buildUrl(api.roadmap.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.roadmap.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      return api.roadmap.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant analysis queries to refresh the UI
      // Since we don't have the resumeId readily available in the variables without passing it,
      // we can invalidate all analysis queries or structured ones if we passed resumeId.
      // For simplicity, we invalidate all analysis queries. A better approach would be to 
      // return the resumeId from the backend or pass it in the mutation context.
      queryClient.invalidateQueries({
        queryKey: [api.resumes.getAnalysis.path]
      });
    },
  });
}
