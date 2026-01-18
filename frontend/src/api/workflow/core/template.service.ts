/**
 * Workflow Template Service
 * Handles workflow template CRUD operations
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { WorkflowFilters, WorkflowTemplate } from "./types";

export class WorkflowTemplateService {
  /**
   * Get all workflow templates with optional filters
   */
  async getTemplates(filters?: WorkflowFilters): Promise<WorkflowTemplate[]> {
    try {
      return await apiClient.get<WorkflowTemplate[]>(
        "/workflow/templates",
        filters as Record<string, unknown>,
      );
    } catch (error) {
      console.error("[WorkflowTemplateService.getTemplates] Error:", error);
      throw new Error("Failed to fetch workflow templates");
    }
  }

  /**
   * Get workflow template by ID
   */
  async getTemplateById(id: string): Promise<WorkflowTemplate> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.getTemplateById] Invalid id parameter",
      );
    }

    try {
      return await apiClient.get<WorkflowTemplate>(`/workflow/templates/${id}`);
    } catch (error) {
      console.error("[WorkflowTemplateService.getTemplateById] Error:", error);
      throw new Error(`Failed to fetch workflow template with id: ${id}`);
    }
  }

  /**
   * Create a new workflow template
   */
  async createTemplate(
    template: Omit<WorkflowTemplate, "id" | "createdAt" | "updatedAt">,
  ): Promise<WorkflowTemplate> {
    if (!template.name) {
      throw new Error(
        "[WorkflowTemplateService.createTemplate] Template name is required",
      );
    }

    try {
      return await apiClient.post<WorkflowTemplate>(
        "/workflow/templates",
        template,
      );
    } catch (error) {
      console.error("[WorkflowTemplateService.createTemplate] Error:", error);
      throw new Error("Failed to create workflow template");
    }
  }

  /**
   * Update an existing workflow template
   */
  async updateTemplate(
    id: string,
    template: Partial<WorkflowTemplate>,
  ): Promise<WorkflowTemplate> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.updateTemplate] Invalid id parameter",
      );
    }

    try {
      return await apiClient.put<WorkflowTemplate>(
        `/workflow/templates/${id}`,
        template,
      );
    } catch (error) {
      console.error("[WorkflowTemplateService.updateTemplate] Error:", error);
      throw new Error(`Failed to update workflow template with id: ${id}`);
    }
  }

  /**
   * Delete a workflow template
   */
  async deleteTemplate(id: string): Promise<void> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.deleteTemplate] Invalid id parameter",
      );
    }

    try {
      await apiClient.delete(`/workflow/templates/${id}`);
    } catch (error) {
      console.error("[WorkflowTemplateService.deleteTemplate] Error:", error);
      throw new Error(`Failed to delete workflow template with id: ${id}`);
    }
  }

  /**
   * Activate a workflow template
   */
  async activateTemplate(id: string): Promise<WorkflowTemplate> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.activateTemplate] Invalid id parameter",
      );
    }

    try {
      return await apiClient.post<WorkflowTemplate>(
        `/workflow/templates/${id}/activate`,
        {},
      );
    } catch (error) {
      console.error("[WorkflowTemplateService.activateTemplate] Error:", error);
      throw new Error(`Failed to activate workflow template with id: ${id}`);
    }
  }

  /**
   * Deactivate a workflow template
   */
  async deactivateTemplate(id: string): Promise<WorkflowTemplate> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.deactivateTemplate] Invalid id parameter",
      );
    }

    try {
      return await apiClient.post<WorkflowTemplate>(
        `/workflow/templates/${id}/deactivate`,
        {},
      );
    } catch (error) {
      console.error(
        "[WorkflowTemplateService.deactivateTemplate] Error:",
        error,
      );
      throw new Error(`Failed to deactivate workflow template with id: ${id}`);
    }
  }

  /**
   * Duplicate a workflow template
   */
  async duplicateTemplate(id: string): Promise<WorkflowTemplate> {
    if (!id) {
      throw new Error(
        "[WorkflowTemplateService.duplicateTemplate] Invalid id parameter",
      );
    }

    try {
      return await apiClient.post<WorkflowTemplate>(
        `/workflow/templates/${id}/duplicate`,
        {},
      );
    } catch (error) {
      console.error(
        "[WorkflowTemplateService.duplicateTemplate] Error:",
        error,
      );
      throw new Error(`Failed to duplicate workflow template with id: ${id}`);
    }
  }

  // IApiService implementation
  async getAll(options?: any): Promise<WorkflowTemplate[]> {
    return this.getTemplates(options);
  }

  async getById(id: string): Promise<WorkflowTemplate | undefined> {
    try {
      return await this.getTemplateById(id);
    } catch {
      return undefined;
    }
  }

  async create(item: any): Promise<WorkflowTemplate> {
    return this.createTemplate(item as any);
  }

  async update(
    id: string,
    updates: Partial<WorkflowTemplate>,
  ): Promise<WorkflowTemplate> {
    return this.updateTemplate(id, updates);
  }

  async delete(id: string): Promise<void> {
    return this.deleteTemplate(id);
  }
}

export const workflowTemplateService = new WorkflowTemplateService();
