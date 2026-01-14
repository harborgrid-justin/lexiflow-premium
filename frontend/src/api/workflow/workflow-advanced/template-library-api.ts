/**
 * Template Library API
 * Feature 4: Template library 2.0 with AI categorization
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { WorkflowTemplate } from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Search templates with AI-powered categorization
 */
export async function searchTemplates(query: {
  search?: string;
  categories?: string[];
  tags?: string[];
  complexity?: string;
  practiceAreas?: string[];
  jurisdiction?: string[];
  minRating?: number;
  certified?: boolean;
}): Promise<WorkflowTemplate[]> {
  return apiClient.get(`${BASE_URL}/templates/search`, query);
}

/**
 * Get AI-suggested categories for a template
 */
export async function getAICategories(
  templateId: string
): Promise<Array<{ category: string; confidence: number }>> {
  return apiClient.get(
    `${BASE_URL}/templates/${templateId}/ai-categories`
  );
}

/**
 * Fork a template
 */
export async function forkTemplate(
  templateId: string,
  name: string
): Promise<WorkflowTemplate> {
  return apiClient.post(`${BASE_URL}/templates/${templateId}/fork`, {
    name,
  });
}

/**
 * Rate and review template
 */
export async function rateTemplate(
  templateId: string,
  rating: number,
  comment?: string
): Promise<WorkflowTemplate> {
  return apiClient.post(`${BASE_URL}/templates/${templateId}/rate`, {
    rating,
    comment,
  });
}

/**
 * Get template analytics
 */
export async function getTemplateAnalytics(templateId: string): Promise<{
  usageCount: number;
  averageRating: number;
  forkCount: number;
  favoriteCount: number;
  categoryDistribution: Record<string, number>;
}> {
  return apiClient.get(`${BASE_URL}/templates/${templateId}/analytics`);
}
