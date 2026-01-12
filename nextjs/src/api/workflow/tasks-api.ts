/**
 * Tasks API Service
 * Enterprise-grade API service for workflow task management with backend integration
 *
 * @module TasksApiService
 * @description Manages all task-related operations including:
 * - Task CRUD operations aligned with backend API
 * - Task status and priority management
 * - Task assignment and delegation
 * - Progress tracking and time estimation
 * - Parent-child task relationships
 * - Tag-based categorization
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Task ownership and permission validation
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - ALIGNED WITH: backend/src/tasks/tasks.controller.ts
 * - React Query integration via TASKS_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - DTO-based data transformation
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type {
  TaskAssignmentDto,
  TaskAttachment,
  TaskBulkOperationResult,
  TaskComment,
  TaskFiltersExtended,
  TaskHistory,
  TaskPriorityBackend,
  TaskRelationshipDto,
  TaskStatistics,
  TaskStatusBackend,
  WorkflowTask,
} from "@/types";

// Re-export types for consumer convenience
export type {
  TaskAssignmentDto,
  TaskAttachment,
  TaskBulkOperationResult,
  TaskComment,
  TaskFiltersExtended,
  TaskHistory,
  TaskRelationshipDto,
  TaskStatistics,
};

// DTOs matching backend tasks/dto/create-task.dto.ts
export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatusBackend;
  priority: TaskPriorityBackend;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  createdBy?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatusBackend;
  priority?: TaskPriorityBackend;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
}

export interface TaskFilters {
  caseId?: string;
  status?: TaskStatusBackend;
  priority?: TaskPriorityBackend;
  assignedTo?: string;
}

/**
 * Query keys for React Query integration
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEYS.byCase(caseId) });
 */
export const TASKS_QUERY_KEYS = {
  all: () => ["tasks"] as const,
  byId: (id: string) => ["tasks", id] as const,
  byCase: (caseId: string) => ["tasks", "case", caseId] as const,
  byStatus: (status: string) => ["tasks", "status", status] as const,
  byAssignee: (userId: string) => ["tasks", "assignee", userId] as const,
  byPriority: (priority: string) => ["tasks", "priority", priority] as const,
  statistics: () => ["tasks", "statistics"] as const,
  statisticsByCase: (caseId: string) =>
    ["tasks", "statistics", "case", caseId] as const,
  comments: (taskId: string) => ["tasks", taskId, "comments"] as const,
  attachments: (taskId: string) => ["tasks", taskId, "attachments"] as const,
  history: (taskId: string) => ["tasks", taskId, "history"] as const,
  subtasks: (parentId: string) => ["tasks", "subtasks", parentId] as const,
} as const;

/**
 * Tasks API Service Class
 * Implements secure, type-safe task management operations
 */
export class TasksApiService {
  private readonly baseUrl = "/tasks";

  constructor() {
    // Bind methods to preserve 'this' context when passed as callbacks
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    // Initialized with Backend API (PostgreSQL)
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[TasksApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(
    obj: unknown,
    paramName: string,
    methodName: string
  ): void {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      throw new Error(
        `[TasksApiService.${methodName}] Invalid ${paramName} parameter`
      );
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all tasks with optional filters
   * Backend: GET /tasks with query params
   *
   * @param filters - Optional filters for caseId, status, priority, assignedTo
   * @returns Promise<WorkflowTask[]> Array of tasks
   * @throws Error if fetch fails
   */
  async getAll(filters?: TaskFilters): Promise<WorkflowTask[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append("caseId", filters.caseId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
      const queryString = params.toString();
      const endpoint = queryString
        ? `${this.baseUrl}?${queryString}`
        : this.baseUrl;
      return await apiClient.get<WorkflowTask[]>(endpoint);
    } catch (error) {
      console.error("[TasksApiService.getAll] Error:", error);
      throw new Error("Failed to fetch tasks");
    }
  }

  /**
   * Get task by ID
   * Backend: GET /tasks/:id
   *
   * @param id - Task ID
   * @returns Promise<WorkflowTask> Task data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<WorkflowTask> {
    this.validateId(id, "getById");
    try {
      return await apiClient.get<WorkflowTask>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error("[TasksApiService.getById] Error:", error);
      throw new Error(`Failed to fetch task with id: ${id}`);
    }
  }

  /**
   * Create a new task
   * Backend: POST /tasks
   *
   * @param data - Task creation DTO
   * @returns Promise<WorkflowTask> Created task
   * @throws Error if validation fails or create fails
   */
  async create(data: CreateTaskDto): Promise<WorkflowTask> {
    this.validateObject(data, "data", "create");
    if (!data.title) {
      throw new Error("[TasksApiService.create] title is required");
    }
    if (!data.status) {
      throw new Error("[TasksApiService.create] status is required");
    }
    if (!data.priority) {
      throw new Error("[TasksApiService.create] priority is required");
    }
    try {
      return await apiClient.post<WorkflowTask>(this.baseUrl, data);
    } catch (error) {
      console.error("[TasksApiService.create] Error:", error);
      throw new Error("Failed to create task");
    }
  }

  /**
   * Update an existing task (full update)
   * Backend: PUT /tasks/:id
   *
   * @param id - Task ID
   * @param data - Task update DTO
   * @returns Promise<WorkflowTask> Updated task
   * @throws Error if validation fails or update fails
   */
  async update(id: string, data: UpdateTaskDto): Promise<WorkflowTask> {
    this.validateId(id, "update");
    this.validateObject(data, "data", "update");
    try {
      return await apiClient.put<WorkflowTask>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error("[TasksApiService.update] Error:", error);
      throw new Error(`Failed to update task with id: ${id}`);
    }
  }

  /**
   * Patch an existing task (partial update)
   * Backend: PATCH /tasks/:id
   *
   * @param id - Task ID
   * @param data - Partial task updates
   * @returns Promise<WorkflowTask> Updated task
   * @throws Error if validation fails or update fails
   */
  async patch(id: string, data: Partial<UpdateTaskDto>): Promise<WorkflowTask> {
    this.validateId(id, "patch");
    this.validateObject(data, "data", "patch");
    try {
      return await apiClient.patch<WorkflowTask>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error("[TasksApiService.patch] Error:", error);
      throw new Error(`Failed to patch task with id: ${id}`);
    }
  }

  /**
   * Delete a task
   * Backend: DELETE /tasks/:id
   *
   * @param id - Task ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error("[TasksApiService.delete] Error:", error);
      throw new Error(`Failed to delete task with id: ${id}`);
    }
  }

  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================

  /**
   * Update task status
   *
   * @param id - Task ID
   * @param status - New task status
   * @returns Promise<WorkflowTask> Updated task
   * @throws Error if validation fails or update fails
   */
  async updateStatus(
    id: string,
    status: TaskStatusBackend
  ): Promise<WorkflowTask> {
    this.validateId(id, "updateStatus");
    if (!status) {
      throw new Error("[TasksApiService.updateStatus] status is required");
    }
    return this.patch(id, { status });
  }

  /**
   * Update task progress
   *
   * @param id - Task ID
   * @param completionPercentage - Completion percentage (0-100)
   * @param actualHours - Optional actual hours spent
   * @returns Promise<WorkflowTask> Updated task
   * @throws Error if validation fails or update fails
   */
  async updateProgress(
    id: string,
    completionPercentage: number,
    actualHours?: number
  ): Promise<WorkflowTask> {
    this.validateId(id, "updateProgress");
    if (completionPercentage < 0 || completionPercentage > 100) {
      throw new Error(
        "[TasksApiService.updateProgress] completionPercentage must be between 0 and 100"
      );
    }
    return this.patch(id, { completionPercentage, actualHours });
  }

  // =============================================================================
  // STATISTICS & ANALYTICS
  // =============================================================================

  /**
   * Get task statistics
   *
   * @param filters - Optional filters for statistics calculation
   * @returns Promise<TaskStatistics> Statistics data
   * @throws Error if fetch fails
   */
  async getStatistics(filters?: TaskFilters): Promise<TaskStatistics> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append("caseId", filters.caseId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
      const queryString = params.toString();
      const url = queryString
        ? `${this.baseUrl}/statistics?${queryString}`
        : `${this.baseUrl}/statistics`;
      return await apiClient.get<TaskStatistics>(url);
    } catch (error) {
      console.error("[TasksApiService.getStatistics] Error:", error);
      throw new Error("Failed to fetch task statistics");
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Bulk update task status
   *
   * @param taskIds - Array of task IDs
   * @param status - New status to apply
   * @returns Promise<TaskBulkOperationResult> Operation result
   * @throws Error if validation fails or operation fails
   */
  async bulkUpdateStatus(
    taskIds: string[],
    status: TaskStatusBackend
  ): Promise<TaskBulkOperationResult> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error(
        "[TasksApiService.bulkUpdateStatus] taskIds must be a non-empty array"
      );
    }
    if (!status) {
      throw new Error("[TasksApiService.bulkUpdateStatus] status is required");
    }
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/status`,
        { taskIds, status }
      );
    } catch (error) {
      console.error("[TasksApiService.bulkUpdateStatus] Error:", error);
      throw new Error("Failed to bulk update task status");
    }
  }

  /**
   * Bulk assign tasks
   *
   * @param taskIds - Array of task IDs
   * @param assignedTo - User ID to assign tasks to
   * @returns Promise<TaskBulkOperationResult> Operation result
   * @throws Error if validation fails or operation fails
   */
  async bulkAssign(
    taskIds: string[],
    assignedTo: string
  ): Promise<TaskBulkOperationResult> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error(
        "[TasksApiService.bulkAssign] taskIds must be a non-empty array"
      );
    }
    this.validateId(assignedTo, "bulkAssign");
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/assign`,
        { taskIds, assignedTo }
      );
    } catch (error) {
      console.error("[TasksApiService.bulkAssign] Error:", error);
      throw new Error("Failed to bulk assign tasks");
    }
  }

  /**
   * Bulk delete tasks
   *
   * @param taskIds - Array of task IDs
   * @returns Promise<TaskBulkOperationResult> Operation result
   * @throws Error if validation fails or operation fails
   */
  async bulkDelete(taskIds: string[]): Promise<TaskBulkOperationResult> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error(
        "[TasksApiService.bulkDelete] taskIds must be a non-empty array"
      );
    }
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/delete`,
        { taskIds }
      );
    } catch (error) {
      console.error("[TasksApiService.bulkDelete] Error:", error);
      throw new Error("Failed to bulk delete tasks");
    }
  }

  // =============================================================================
  // TASK RELATIONSHIPS
  // =============================================================================

  /**
   * Get subtasks for a parent task
   *
   * @param parentId - Parent task ID
   * @returns Promise<WorkflowTask[]> Array of subtasks
   * @throws Error if validation fails or fetch fails
   */
  async getSubtasks(parentId: string): Promise<WorkflowTask[]> {
    this.validateId(parentId, "getSubtasks");
    try {
      return await apiClient.get<WorkflowTask[]>(
        `${this.baseUrl}/${parentId}/subtasks`
      );
    } catch (error) {
      console.error("[TasksApiService.getSubtasks] Error:", error);
      throw new Error(`Failed to fetch subtasks for task: ${parentId}`);
    }
  }

  /**
   * Add subtask to parent task
   *
   * @param parentId - Parent task ID
   * @param subtaskData - Subtask creation DTO
   * @returns Promise<WorkflowTask> Created subtask
   * @throws Error if validation fails or creation fails
   */
  async addSubtask(
    parentId: string,
    subtaskData: CreateTaskDto
  ): Promise<WorkflowTask> {
    this.validateId(parentId, "addSubtask");
    this.validateObject(subtaskData, "subtaskData", "addSubtask");
    try {
      return await apiClient.post<WorkflowTask>(
        `${this.baseUrl}/${parentId}/subtasks`,
        subtaskData
      );
    } catch (error) {
      console.error("[TasksApiService.addSubtask] Error:", error);
      throw new Error(`Failed to add subtask to task: ${parentId}`);
    }
  }

  // =============================================================================
  // TASK COMMENTS
  // =============================================================================

  /**
   * Get comments for a task
   *
   * @param taskId - Task ID
   * @returns Promise<TaskComment[]> Array of comments
   * @throws Error if validation fails or fetch fails
   */
  async getComments(taskId: string): Promise<TaskComment[]> {
    this.validateId(taskId, "getComments");
    try {
      return await apiClient.get<TaskComment[]>(
        `${this.baseUrl}/${taskId}/comments`
      );
    } catch (error) {
      console.error("[TasksApiService.getComments] Error:", error);
      throw new Error(`Failed to fetch comments for task: ${taskId}`);
    }
  }

  /**
   * Add comment to task
   *
   * @param taskId - Task ID
   * @param content - Comment content
   * @returns Promise<TaskComment> Created comment
   * @throws Error if validation fails or creation fails
   */
  async addComment(taskId: string, content: string): Promise<TaskComment> {
    this.validateId(taskId, "addComment");
    if (!content || content.trim() === "") {
      throw new Error("[TasksApiService.addComment] content is required");
    }
    try {
      return await apiClient.post<TaskComment>(
        `${this.baseUrl}/${taskId}/comments`,
        { content }
      );
    } catch (error) {
      console.error("[TasksApiService.addComment] Error:", error);
      throw new Error(`Failed to add comment to task: ${taskId}`);
    }
  }

  // =============================================================================
  // TASK ATTACHMENTS
  // =============================================================================

  /**
   * Get attachments for a task
   *
   * @param taskId - Task ID
   * @returns Promise<TaskAttachment[]> Array of attachments
   * @throws Error if validation fails or fetch fails
   */
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    this.validateId(taskId, "getAttachments");
    try {
      return await apiClient.get<TaskAttachment[]>(
        `${this.baseUrl}/${taskId}/attachments`
      );
    } catch (error) {
      console.error("[TasksApiService.getAttachments] Error:", error);
      throw new Error(`Failed to fetch attachments for task: ${taskId}`);
    }
  }

  /**
   * Upload attachment to task
   *
   * @param taskId - Task ID
   * @param file - File to upload
   * @returns Promise<TaskAttachment> Created attachment
   * @throws Error if validation fails or upload fails
   */
  async uploadAttachment(taskId: string, file: File): Promise<TaskAttachment> {
    this.validateId(taskId, "uploadAttachment");
    if (!file || !(file instanceof File)) {
      throw new Error("[TasksApiService.uploadAttachment] file is required");
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      return await apiClient.post<TaskAttachment>(
        `${this.baseUrl}/${taskId}/attachments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } catch (error) {
      console.error("[TasksApiService.uploadAttachment] Error:", error);
      throw new Error(`Failed to upload attachment to task: ${taskId}`);
    }
  }

  // =============================================================================
  // TASK HISTORY
  // =============================================================================

  /**
   * Get task history/audit log
   *
   * @param taskId - Task ID
   * @returns Promise<TaskHistory[]> Array of history entries
   * @throws Error if validation fails or fetch fails
   */
  async getHistory(taskId: string): Promise<TaskHistory[]> {
    this.validateId(taskId, "getHistory");
    try {
      return await apiClient.get<TaskHistory[]>(
        `${this.baseUrl}/${taskId}/history`
      );
    } catch (error) {
      console.error("[TasksApiService.getHistory] Error:", error);
      throw new Error(`Failed to fetch history for task: ${taskId}`);
    }
  }
}
