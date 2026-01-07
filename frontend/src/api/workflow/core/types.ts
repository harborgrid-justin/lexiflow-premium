/**
 * Workflow Core Types
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: "active" | "inactive" | "draft";
  trigger?: {
    type: "manual" | "event" | "scheduled";
    event?: string;
    schedule?: string;
  };
  steps: {
    id: string;
    name: string;
    type: "task" | "approval" | "notification" | "automation";
    order: number;
    config?: Record<string, unknown>;
    assignee?: string;
    dependencies?: string[];
  }[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  caseId?: string;
  matterId?: string;
  status: "running" | "paused" | "completed" | "failed" | "cancelled";
  currentStep?: string;
  startedAt: string;
  completedAt?: string;
  progress?: number;
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WorkflowFilters {
  status?: WorkflowTemplate["status"];
  category?: string;
}

export interface WorkflowExecutionOptions {
  variables?: Record<string, unknown>;
  caseId?: string;
  matterId?: string;
}
