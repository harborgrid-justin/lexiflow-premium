/**
 * Workflows Domain - Data Loader
 * Enterprise React Architecture Pattern
 *
 * Responsibilities:
 * - Fetch workflow templates and instances
 * - Parallel data loading for performance
 * - Type-safe data contracts
 */

import { DataService } from "../../services/data/dataService";
import type { Task, WorkflowInstance, WorkflowTemplate } from "../../types";

export interface WorkflowsLoaderData {
  templates: WorkflowTemplate[];
  instances: WorkflowInstance[];
  tasks: Task[];
}

/**
 * Loader for Workflows Dashboard
 * Fetches all workflow-related data in parallel for optimal performance
 */
export async function workflowsLoader(): Promise<WorkflowsLoaderData> {
  // Parallel data fetching for optimal performance
  const [templates, instances, tasks] = await Promise.all([
    DataService.workflow.getTemplates(),
    DataService.workflow.getInstances(),
    DataService.workflow.getTasks(),
  ]);

  return {
    templates: templates || [],
    instances: instances || [],
    tasks: tasks || [],
  };
}
