/**
 * Workflow Domain Normalizers
 */

import {
  normalizeArray,
  normalizeDate,
  normalizeEnum,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./core";

const TASK_STATUS_MAP: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

const TASK_PRIORITY_MAP: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

interface BackendTask {
  id: string | number;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  case_id?: string;
  created_by?: string;
  completed_at?: string;
}

export const normalizeTask: Normalizer<BackendTask, unknown> = (backend) => {
  return {
    id: normalizeId(backend.id),
    title: normalizeString(backend.title),
    description: normalizeString(backend.description),
    status: normalizeEnum(backend.status, TASK_STATUS_MAP, "Pending"),
    priority: normalizeEnum(backend.priority, TASK_PRIORITY_MAP, "Medium"),
    dueDate: normalizeDate(backend.due_date),
    assignedTo: normalizeString(backend.assigned_to),
    caseId: normalizeString(backend.case_id),
    createdBy: normalizeString(backend.created_by),
    completedAt: normalizeDate(backend.completed_at),
  };
};

export function normalizeTasks(backend: unknown): unknown[] {
  return normalizeArray(backend, normalizeTask);
}
