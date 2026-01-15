/**
 * Workflow Frontend API
 * Enterprise-grade API layer for task and workflow management
 *
 * @module lib/frontend-api/workflow
 * @description Domain-level contract for workflow operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Task CRUD operations
 * - Task assignment and delegation
 * - Calendar and deadline management
 * - Workflow status tracking
 * - Task dependencies
 * - Bulk operations
 *
 * @example
 * ```typescript
 * // Create a task
 * const result = await workflow.createTask({
 *   title: 'Review contract',
 *   caseId: 'case-123',
 *   dueDate: new Date('2025-02-01'),
 *   assignedTo: 'attorney-456',
 * });
 * ```
 */

import type { Task } from "@/types";
import { normalizeTask, normalizeTasks } from "../normalization/workflow";
import { client } from "./client";
import { NotFoundError, ValidationError } from "./errors";
import { failure, type PaginatedResult, type Result, success } from "./types";

/**
 * Task query filters
 */
export interface TaskFilters {
  caseId?: string;
  assignedTo?: string;
  status?: "open" | "in-progress" | "completed" | "closed";
  priority?: "low" | "medium" | "high" | "critical";
  dueFrom?: string;
  dueTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Task creation input
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  caseId?: string;
  assignedTo?: string;
  dueDate?: Date | string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Task update input
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  assignedTo?: string;
  dueDate?: Date | string | null;
  priority?: "low" | "medium" | "high" | "critical";
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Task assignment input
 */
export interface AssignTaskInput {
  assignedTo: string;
  reassignPreviousOwner?: boolean;
}

/**
 * Get all tasks with optional filtering
 */
export async function getAllTasks(
  filters?: TaskFilters
): Promise<Result<PaginatedResult<Task>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters?.status) params.status = filters.status;
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.search) params.search = filters.search;
  if (filters?.dueFrom) params.dueFrom = filters.dueFrom;
  if (filters?.dueTo) params.dueTo = filters.dueTo;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/tasks", { params });

  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeTasks(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Result<Task>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid task ID is required"));
  }

  const result = await client.get<unknown>(`/tasks/${id}`);

  if (!result.ok) return result;

  if (!result.data) {
    return failure(new NotFoundError(`Task ${id} not found`));
  }

  return success(normalizeTask(result.data));
}

/**
 * Create task
 */
export async function createTask(
  input: CreateTaskInput
): Promise<Result<Task>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Task input is required"));
  }

  if (!input.title || typeof input.title !== "string") {
    return failure(new ValidationError("Task title is required"));
  }

  const result = await client.post<unknown>("/tasks", input);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Result<Task>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid task ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.patch<unknown>(`/tasks/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

/**
 * Delete task
 */
export async function removeTask(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid task ID is required"));
  }

  return client.delete<void>(`/tasks/${id}`);
}

/**
 * Mark task as completed
 */
export async function completeTask(id: string): Promise<Result<Task>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid task ID is required"));
  }

  const result = await client.post<unknown>(`/tasks/${id}/complete`);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

/**
 * Reassign task to another user
 */
export async function assignTask(
  id: string,
  input: AssignTaskInput
): Promise<Result<Task>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid task ID is required"));
  }

  if (!input.assignedTo || typeof input.assignedTo !== "string") {
    return failure(new ValidationError("Assigned user ID is required"));
  }

  const result = await client.patch<unknown>(`/tasks/${id}/assign`, input);

  if (!result.ok) return result;
  return success(normalizeTask(result.data));
}

/**
 * Get tasks for a specific case
 */
export async function getTasksByCase(caseId: string): Promise<Result<Task[]>> {
  if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
    return failure(new ValidationError("Valid case ID is required"));
  }

  const result = await getAllTasks({ caseId, limit: 1000 });

  if (!result.ok) return result;

  return success(result.data.data);
}

/**
 * Get tasks assigned to a specific user
 */
export async function getTasksAssignedTo(
  userId: string
): Promise<Result<Task[]>> {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return failure(new ValidationError("Valid user ID is required"));
  }

  const result = await getAllTasks({ assignedTo: userId, limit: 1000 });

  if (!result.ok) return result;

  return success(result.data.data);
}

/**
 * Search tasks by text query
 */
export async function searchTasks(
  query: string,
  options?: { limit?: number }
): Promise<Result<Task[]>> {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return failure(new ValidationError("Search query is required"));
  }

  const params: Record<string, string | number> = { q: query.trim() };
  if (options?.limit) params.limit = options.limit;

  const result = await client.get<unknown>("/tasks/search", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeTasks(items));
}

/**
 * Get upcoming tasks (within days)
 */
export async function getUpcomingTasks(
  days: number = 7
): Promise<Result<Task[]>> {
  if (typeof days !== "number" || days <= 0) {
    return failure(new ValidationError("Days must be a positive number"));
  }

  const result = await client.get<unknown>("/tasks/upcoming", {
    params: { days },
  });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeTasks(items));
}

/**
 * Bulk update tasks
 */
export async function bulkUpdateTasks(
  ids: string[],
  updates: Partial<UpdateTaskInput>
): Promise<Result<Task[]>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return failure(new ValidationError("At least one task ID is required"));
  }

  if (
    !updates ||
    typeof updates !== "object" ||
    Object.keys(updates).length === 0
  ) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.post<unknown>("/tasks/bulk-update", {
    ids,
    updates,
  });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeTasks(items));
}

/**
 * Risks sub-module (stub implementation)
 */
const risks = {
  async getAll() {
    return await client.get<unknown[]>("/workflow/risks");
  },
  async getById(id: string) {
    return await client.get<unknown>(`/workflow/risks/${id}`);
  },
  async create(data: unknown) {
    return await client.post<unknown>("/workflow/risks", data);
  },
};

/**
 * War Room sub-module (stub implementation)
 */
const warRoom = {
  async getSessions() {
    return await client.get<unknown[]>("/workflow/war-room");
  },
  async createSession(data: unknown) {
    return await client.post<unknown>("/workflow/war-room", data);
  },
  async joinSession(sessionId: string) {
    return await client.post<void>(`/workflow/war-room/${sessionId}/join`);
  },
};

/**
 * Workflow API module
 */
export const workflowApi = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  removeTask,
  completeTask,
  assignTask,
  getTasksByCase,
  getTasksAssignedTo,
  searchTasks,
  getUpcomingTasks,
  bulkUpdateTasks,
  // Sub-modules for descriptor compatibility
  risks,
  warRoom,
  // Convenience alias
  getAll: getAllTasks,
} as const;
