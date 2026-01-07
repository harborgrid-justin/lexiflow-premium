/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Template Library Service - Feature 4
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { WorkflowTemplate } from "@/types/workflow-advanced-types";

export class TemplateLibraryService {
  private readonly baseUrl = "/workflow/advanced";

  async search(query: {
    search?: string;
    categories?: string[];
    tags?: string[];
    complexity?: string;
    practiceAreas?: string[];
    jurisdiction?: string[];
    minRating?: number;
    certified?: boolean;
  }) {
    return apiClient.get<WorkflowTemplate[]>(
      `${this.baseUrl}/templates/search`,
      query
    );
  }

  async getAICategories(templateId: string) {
    return apiClient.get<Array<{ category: string; confidence: number }>>(
      `${this.baseUrl}/templates/${templateId}/ai-categories`
    );
  }

  async fork(templateId: string, name: string) {
    return apiClient.post<WorkflowTemplate>(
      `${this.baseUrl}/templates/${templateId}/fork`,
      { name }
    );
  }

  async rate(templateId: string, rating: number, comment?: string) {
    return apiClient.post<WorkflowTemplate>(
      `${this.baseUrl}/templates/${templateId}/rate`,
      { rating, comment }
    );
  }

  async getAnalytics(templateId: string) {
    return apiClient.get(`${this.baseUrl}/templates/${templateId}/analytics`);
  }
}
