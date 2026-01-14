/**
 * Workflow Instance Service
 * Handles workflow instance lifecycle and execution
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { WorkflowExecutionOptions, WorkflowInstance } from "./types";

export class WorkflowInstanceService {
  /**
   * Get all workflow instances with optional filters
   */
  async getInstances(filters?: {
    status?: WorkflowInstance["status"];
    caseId?: string;
    matterId?: string;
  }): Promise<WorkflowInstance[]> {
    try {
      return await apiClient.get<WorkflowInstance[]>(
        "/workflow/instances",
        filters ? { params: filters } : undefined
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.getInstances] Error:", error);
      throw new Error("Failed to fetch workflow instances");
    }
  }

  /**
   * Get workflow instance by ID
   */
  async getInstanceById(id: string): Promise<WorkflowInstance> {
    if (!id) {
      throw new Error(
        "[WorkflowInstanceService.getInstanceById] Invalid id parameter"
      );
    }

    try {
      return await apiClient.get<WorkflowInstance>(`/workflow/instances/${id}`);
    } catch (error) {
      console.error("[WorkflowInstanceService.getInstanceById] Error:", error);
      throw new Error(`Failed to fetch workflow instance with id: ${id}`);
    }
  }

  /**
   * Start a workflow instance from a template
   */
  async startWorkflow(
    templateId: string,
    options?: WorkflowExecutionOptions
  ): Promise<WorkflowInstance> {
    if (!templateId) {
      throw new Error(
        "[WorkflowInstanceService.startWorkflow] Template ID is required"
      );
    }

    try {
      return await apiClient.post<WorkflowInstance>("/workflow/instances", {
        templateId,
        ...options,
      });
    } catch (error) {
      console.error("[WorkflowInstanceService.startWorkflow] Error:", error);
      throw new Error("Failed to start workflow instance");
    }
  }

  /**
   * Pause a running workflow instance
   */
  async pauseWorkflow(id: string): Promise<WorkflowInstance> {
    if (!id) {
      throw new Error(
        "[WorkflowInstanceService.pauseWorkflow] Invalid id parameter"
      );
    }

    try {
      return await apiClient.post<WorkflowInstance>(
        `/workflow/instances/${id}/pause`,
        {}
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.pauseWorkflow] Error:", error);
      throw new Error(`Failed to pause workflow instance with id: ${id}`);
    }
  }

  /**
   * Resume a paused workflow instance
   */
  async resumeWorkflow(id: string): Promise<WorkflowInstance> {
    if (!id) {
      throw new Error(
        "[WorkflowInstanceService.resumeWorkflow] Invalid id parameter"
      );
    }

    try {
      return await apiClient.post<WorkflowInstance>(
        `/workflow/instances/${id}/resume`,
        {}
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.resumeWorkflow] Error:", error);
      throw new Error(`Failed to resume workflow instance with id: ${id}`);
    }
  }

  /**
   * Cancel a workflow instance
   */
  async cancelWorkflow(id: string): Promise<WorkflowInstance> {
    if (!id) {
      throw new Error(
        "[WorkflowInstanceService.cancelWorkflow] Invalid id parameter"
      );
    }

    try {
      return await apiClient.post<WorkflowInstance>(
        `/workflow/instances/${id}/cancel`,
        {}
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.cancelWorkflow] Error:", error);
      throw new Error(`Failed to cancel workflow instance with id: ${id}`);
    }
  }

  /**
   * Complete a step in a workflow instance
   */
  async completeStep(
    instanceId: string,
    stepId: string,
    data?: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    if (!instanceId || !stepId) {
      throw new Error(
        "[WorkflowInstanceService.completeStep] Instance ID and step ID are required"
      );
    }

    try {
      return await apiClient.post<WorkflowInstance>(
        `/workflow/instances/${instanceId}/steps/${stepId}/complete`,
        data || {}
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.completeStep] Error:", error);
      throw new Error("Failed to complete workflow step");
    }
  }

  /**
   * Update workflow instance variables
   */
  async updateVariables(
    id: string,
    variables: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    if (!id) {
      throw new Error(
        "[WorkflowInstanceService.updateVariables] Invalid id parameter"
      );
    }

    try {
      return await apiClient.patch<WorkflowInstance>(
        `/workflow/instances/${id}/variables`,
        { variables }
      );
    } catch (error) {
      console.error("[WorkflowInstanceService.updateVariables] Error:", error);
      throw new Error(`Failed to update workflow variables for id: ${id}`);
    }
  }

  /**
   * Get active workflow instances
   */
  async getActiveInstances(): Promise<WorkflowInstance[]> {
    try {
      return await apiClient.get<WorkflowInstance[]>(
        "/workflow/instances/active"
      );
    } catch (error) {
      console.error(
        "[WorkflowInstanceService.getActiveInstances] Error:",
        error
      );
      return [];
    }
  }
}

export const workflowInstanceService = new WorkflowInstanceService();
