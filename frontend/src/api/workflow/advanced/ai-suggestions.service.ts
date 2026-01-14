/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * AI Suggestions Service - Feature 9
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  AILearningFeedback,
  AIWorkflowSuggestion,
  EnhancedWorkflowInstance,
} from "@/types/workflow-advanced-types";

export class AISuggestionsService {
  private readonly baseUrl = "/workflow/advanced";

  async getSuggestions(
    workflowId: string,
    options?: { minConfidence?: number; types?: string[] }
  ) {
    return apiClient.get<AIWorkflowSuggestion[]>(
      `${this.baseUrl}/${workflowId}/ai/suggestions`,
      options
    );
  }

  async apply(workflowId: string, suggestionId: string) {
    return apiClient.post<EnhancedWorkflowInstance>(
      `${this.baseUrl}/${workflowId}/ai/suggestions/${suggestionId}/apply`
    );
  }

  async provideFeedback(
    workflowId: string,
    suggestionId: string,
    feedback: Partial<AILearningFeedback>
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/ai/suggestions/${suggestionId}/feedback`,
      feedback
    );
  }

  async triggerAnalysis(workflowId: string) {
    return apiClient.post<{ jobId: string; estimatedTime: number }>(
      `${this.baseUrl}/${workflowId}/ai/analyze`
    );
  }

  async getAnalysisStatus(workflowId: string, jobId: string) {
    return apiClient.get(`${this.baseUrl}/${workflowId}/ai/analyze/${jobId}`);
  }
}
