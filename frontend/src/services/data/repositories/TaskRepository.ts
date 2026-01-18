/**
 * Task Repository
 * Enterprise-grade repository for workflow task management with backend API integration
 *
 * @module TaskRepository
 * @description Manages all task-related operations including:
 * - Task CRUD operations
 * - Status transitions and workflow management
 * - Priority and due date tracking
 * - Task assignment and notifications
 * - Progress monitoring
 * - Integration event publishing
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - IndexedDB fallback (development only)
 * - React Query integration via TASK_QUERY_KEYS
 * - Type-safe operations
 * - Event-driven integration
 */

import { TasksApiService } from "@/api/workflow/tasks-api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository, createQueryKeys, type IApiService } from "@/services/core/factories";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import {
  type CaseId,
  type TaskPriorityBackend,
  TaskStatusBackend,
  type UserId,
  type WorkflowTask,
} from "@/types";
import { SystemEventType } from "@/types/integration-types";

// Type alias to satisfy Repository constraint
type WorkflowTaskEntity = WorkflowTask & { createdBy?: UserId };

/**
 * Query keys for React Query integration
 */
export const TASK_QUERY_KEYS = {
  ...createQueryKeys('tasks'),
  byCase: (caseId: string) => ["tasks", "case", caseId] as const,
  byUser: (userId: string) => ["tasks", "user", userId] as const,
  byStatus: (status: string) => ["tasks", "status", status] as const,
  byPriority: (priority: string) => ["tasks", "priority", priority] as const,
  overdue: () => ["tasks", "overdue"] as const,
  upcoming: () => ["tasks", "upcoming"] as const,
} as const;

/**
 * Task Repository Class
 * Implements strict backend pattern
 */
export class TaskRepository extends GenericRepository<WorkflowTaskEntity> {
  protected apiService: IApiService<WorkflowTaskEntity> = new TasksApiService();
  protected repositoryName = 'TaskRepository';

  constructor() {
    super('tasks');
    console.log(`[TaskRepository] Initialized with Backend API`);
  }

  /**
   * Validate and sanitize case ID parameter
   * @private
   */
  private validateCaseId(caseId: string, methodName: string): void {
    if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
      throw new Error(
        `[TaskRepository.${methodName}] Invalid caseId parameter`,
      );
    }
  }

  /**
   * Validate and sanitize user ID parameter
   * @private
   */
  private validateUserId(userId: string, methodName: string): void {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new Error(
        `[TaskRepository.${methodName}] Invalid userId parameter`,
      );
    }
  }

  // =============================================================================
  // CRUD OPERATIONS - Inherited from GenericRepository
  // Custom override for update to publish integration events
  // =============================================================================

  override async update(
    id: string,
    updates: Partial<WorkflowTaskEntity>,
  ): Promise<WorkflowTaskEntity> {
    const result = await super.update(id, updates);

    // Integration Point: Publish event when task is completed
    if (updates.status === TaskStatusBackend.COMPLETED) {
      try {
        await IntegrationEventPublisher.publish(
          SystemEventType.TASK_COMPLETED,
          { task: result },
        );
      } catch (eventError) {
        console.warn(
          "[TaskRepository] Failed to publish integration event",
          eventError,
        );
      }
    }

    return result;
  }

  /**
   * Get tasks by case ID
   */
  override async getByCaseId(caseId: CaseId): Promise<WorkflowTaskEntity[]> {
    this.validateCaseId(caseId, "getByCaseId");
    return (await this.apiService.getAll({ caseId })) as WorkflowTaskEntity[];
  }

  /**
   * Count active tasks by case ID (excludes Done/Completed)
   */
  async countByCaseId(caseId: string): Promise<number> {
    this.validateCaseId(caseId, "countByCaseId");
    const tasks = await this.getByCaseId(caseId as CaseId);
    return tasks.filter((t) => t.status !== TaskStatusBackend.COMPLETED).length;
  }

  // =============================================================================
  // STATUS MANAGEMENT
  // =============================================================================

  /**
   * Mark a task as complete
   */
  completeTask = async (id: string): Promise<WorkflowTaskEntity> => {
    this.validateIdParameter(id, "completeTask");

    const task = await this.getById(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    return await this.update(id, {
      status: TaskStatusBackend.COMPLETED,
      completionPercentage: 100,
    });
  };

  /**
   * Update task status
   */
  async updateStatus(
    id: string,
    status: TaskStatusBackend,
  ): Promise<WorkflowTaskEntity> {
    this.validateIdParameter(id, "updateStatus");

    if (!status || typeof status !== "string" || status.trim() === "") {
      throw new ValidationError(
        "[TaskRepository.updateStatus] Invalid status parameter",
      );
    }

    return (await this.apiService.updateStatus(
      id,
      status,
    )) as WorkflowTaskEntity;
  }

  /**
   * Update task priority
   */
  async updatePriority(
    id: string,
    priority: TaskPriorityBackend,
  ): Promise<WorkflowTaskEntity> {
    this.validateIdParameter(id, "updatePriority");

    if (!priority) {
      throw new ValidationError(
        "[TaskRepository.updatePriority] Invalid priority parameter",
      );
    }

    return await this.update(id, { priority });
  }

  /**
   * Update task progress
   */
  async updateProgress(
    id: string,
    progress: number,
  ): Promise<WorkflowTaskEntity> {
    this.validateIdParameter(id, "updateProgress");

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      throw new ValidationError(
        "[TaskRepository.updateProgress] Invalid progress parameter (must be 0-100)",
      );
    }

    const updates: Partial<WorkflowTaskEntity> = {
      completionPercentage: progress,
    };

    if (progress === 100) {
      updates.status = TaskStatusBackend.COMPLETED;
    }

    return await this.update(id, updates);
  }

  // =============================================================================
  // ASSIGNMENT MANAGEMENT
  // =============================================================================

  /**
   * Assign task to user
   */
  async assignToUser(id: string, userId: UserId): Promise<WorkflowTaskEntity> {
    this.validateIdParameter(id, "assignToUser");
    this.validateUserId(userId, "assignToUser");
    return (await this.apiService.patch(id, { assignedTo: userId })) as WorkflowTaskEntity;
  }

  /**
   * Unassign task from user
   */
  async unassignTask(id: string): Promise<WorkflowTaskEntity> {
    this.validateIdParameter(id, "unassignTask");
    return (await this.apiService.patch(id, { assignedTo: null })) as WorkflowTaskEntity;
  }

  /**
   * Get tasks assigned to user
   */
  async getByAssignee(userId: UserId): Promise<WorkflowTaskEntity[]> {
    this.validateUserId(userId, "getByAssignee");
    return (await this.apiService.getAll({ assignedTo: userId })) as WorkflowTaskEntity[];
  }

  // =============================================================================
  // QUERIES & FILTERING
  // =============================================================================

  /**
   * Get overdue tasks
   */
  async getOverdue(): Promise<WorkflowTaskEntity[]> {
    const tasks = await this.getAll();
    const now = new Date();

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === TaskStatusBackend.COMPLETED)
        return false;
      return new Date(task.dueDate) < now;
    });
  }

  /**
   * Get upcoming tasks (due within specified days)
   */
  async getUpcoming(days: number = 7): Promise<WorkflowTaskEntity[]> {
    const tasks = await this.getAll();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === TaskStatusBackend.COMPLETED)
        return false;
      const due = new Date(task.dueDate);
      return due >= now && due <= future;
    });
  }

  /**
   * Get tasks by status
   */
  async getByStatus(status: string): Promise<WorkflowTaskEntity[]> {
    if (!status || typeof status !== "string" || status.trim() === "") {
      throw new ValidationError(
        "[TaskRepository.getByStatus] Invalid status parameter",
      );
    }
    return (await this.apiService.getAll({
      status: status as TaskStatusBackend,
    })) as WorkflowTaskEntity[];
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority: string): Promise<WorkflowTaskEntity[]> {
    if (!priority || typeof priority !== "string" || priority.trim() === "") {
      throw new ValidationError(
        "[TaskRepository.getByPriority] Invalid priority parameter",
      );
    }
    return (await this.apiService.getAll({
      priority: priority as TaskPriorityBackend,
    })) as WorkflowTaskEntity[];
  }

  /**
   * Search tasks by criteria
   */
  async searchTasks(criteria: {
    caseId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    query?: string;
  }): Promise<WorkflowTaskEntity[]> {
    let tasks = await this.getAll();

    if (criteria.caseId) {
      tasks = tasks.filter((task) => task.caseId === criteria.caseId);
    }

    if (criteria.assignedTo) {
      tasks = tasks.filter((task) => task.assignedTo === criteria.assignedTo);
    }

    if (criteria.status) {
      tasks = tasks.filter((task) => task.status === criteria.status);
    }

    if (criteria.priority) {
      tasks = tasks.filter((task) => task.priority === criteria.priority);
    }

    if (criteria.query) {
      const lowerQuery = criteria.query.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery),
      );
    }

    return tasks;
  }

  // =============================================================================
  // ANALYTICS
  // =============================================================================

  /**
   * Get task statistics
   */
  async getStatistics(caseId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    completed: number;
    overdue: number;
    avgProgress: number;
  }> {
    const tasks = caseId
      ? await this.getByCaseId(caseId as CaseId)
      : await this.getAll();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let completed = 0;
    let totalProgress = 0;

    tasks.forEach((task) => {
      const status = task.status || "unknown";
      byStatus[status] = (byStatus[status] || 0) + 1;

      const priority = task.priority || "medium";
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      if (task.status === TaskStatusBackend.COMPLETED) {
        completed++;
      }

      totalProgress += task.completionPercentage || 0;
    });

    const overdueTasks = await this.getOverdue();
    const overdue = caseId
      ? overdueTasks.filter((t) => t.caseId === caseId).length
      : overdueTasks.length;

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      completed,
      overdue,
      avgProgress: tasks.length > 0 ? totalProgress / tasks.length : 0,
    };
  }
}
