/**
 * Workflow Frontend API
 * Domain contract for tasks, calendar, and workflow management
 */

import { normalizeTask, normalizeTasks } from "../normalization/workflow";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllTasks(filters?: {
  caseId?: string;
  assignedTo?: string;
  status?: string;
}): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/tasks", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeTasks(items));
}

export async function getTaskById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Task ID is required"));

  const result = await client.get<unknown>(`/tasks/${id}`);
  if (!result.ok) return result;

  return success(normalizeTask(result.data));
}

export async function createTask(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/tasks", input);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

export async function updateTask(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Task ID is required"));

  const result = await client.patch<unknown>(`/tasks/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

export async function removeTask(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Task ID is required"));
  return client.delete<void>(`/tasks/${id}`);
}

export async function completeTask(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Task ID is required"));

  const result = await client.post<unknown>(`/tasks/${id}/complete`);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

export const workflowApi = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  removeTask,
  completeTask,
};
