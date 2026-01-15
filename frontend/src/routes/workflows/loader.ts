/**
 * Workflows Domain - Data Loader
 * Enterprise React Architecture Pattern
 *
 * Responsibilities:
 * - Fetch workflow templates and instances
 * - Parallel data loading for performance
 * - Type-safe data contracts
 */

import { DataService } from "@/services/data/data-service.service";
import type { Task, WorkflowInstance, WorkflowTemplate } from "@/types";
import { requireAuthentication } from "@/utils/route-guards";
import { defer, type LoaderFunctionArgs } from "react-router";

export interface WorkflowsLoaderData {
  templates: WorkflowTemplate[];
  instances: WorkflowInstance[];
  tasks: Task[];
}

export interface WorkflowsDeferredLoaderData {
  templates: Promise<WorkflowTemplate[]>;
  instances: Promise<WorkflowInstance[]>;
  tasks: Promise<Task[]>;
}

/**
 * Loader for Workflows Dashboard
 * Fetches all workflow-related data in parallel for optimal performance
 */
export async function workflowsLoader({ request }: LoaderFunctionArgs) {
  requireAuthentication(request);

  // Defer promises so Suspense/Await can be placed in the Page (rendering concern)
  const templates = DataService.workflow
    .getTemplates()
    .catch(() => [] as WorkflowTemplate[]);
  const instances = DataService.workflow
    .getInstances()
    .catch(() => [] as WorkflowInstance[]);
  const tasks = DataService.workflow.getTasks().catch(() => [] as Task[]);

  return defer({
    templates,
    instances,
    tasks,
  });
}
