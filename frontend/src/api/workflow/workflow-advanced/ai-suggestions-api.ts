/**
 * AI Suggestions API
 * Feature 9: AI-powered workflow optimization suggestions
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  AILearningFeedback,
  AIWorkflowSuggestion,
  EnhancedWorkflowInstance,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Get AI-powered workflow suggestions
 */
export async function getAISuggestions(
  workflowId: string,
  options?: { minConfidence?: number; types?: string[] }
): Promise<AIWorkflowSuggestion[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/ai/suggestions`, {
    params: options,
  });
}

/**
 * Apply AI suggestion
 */
export async function applyAISuggestion(
  workflowId: string,
  suggestionId: string
): Promise<EnhancedWorkflowInstance> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/ai/suggestions/${suggestionId}/apply`
  );
}

/**
 * Provide feedback on AI suggestion
 */
export async function provideSuggestionFeedback(
  workflowId: string,
  suggestionId: string,
  feedback: Partial<AILearningFeedback>
): Promise<void> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/ai/suggestions/${suggestionId}/feedback`,
    feedback
  );
}

/**
 * Trigger AI analysis
 */
export async function triggerAIAnalysis(
  workflowId: string
): Promise<{ jobId: string; estimatedTime: number }> {
  return apiClient.post(`${BASE_URL}/${workflowId}/ai/analyze`);
}

/**
 * Get AI analysis status
 */
export async function getAIAnalysisStatus(
  workflowId: string,
  jobId: string
): Promise<{
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  results?: AIWorkflowSuggestion[];
}> {
  return apiClient.get(`${BASE_URL}/${workflowId}/ai/analyze/${jobId}`);
}
