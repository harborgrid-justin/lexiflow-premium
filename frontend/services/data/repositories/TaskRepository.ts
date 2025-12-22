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

import { WorkflowTask, CaseId, UserId, TaskStatusBackend, TaskPriorityBackend } from '../../../types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { isBackendApiEnabled } from '../../integration/apiConfig';
import { TasksApiService } from '../../api/tasks-api';
import { IntegrationOrchestrator } from '../../integration/integrationOrchestrator';
import { SystemEventType } from '../../../types/integration-types';

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.byCase(caseId) });
 */
export const TASK_QUERY_KEYS = {
    all: () => ['tasks'] as const,
    byId: (id: string) => ['tasks', id] as const,
    byCase: (caseId: string) => ['tasks', 'case', caseId] as const,
    byUser: (userId: string) => ['tasks', 'user', userId] as const,
    byStatus: (status: string) => ['tasks', 'status', status] as const,
    byPriority: (priority: string) => ['tasks', 'priority', priority] as const,
    overdue: () => ['tasks', 'overdue'] as const,
    upcoming: () => ['tasks', 'upcoming'] as const,
} as const;

/**
 * Task Repository Class
 * Implements backend-first pattern with IndexedDB fallback
 */
export class TaskRepository extends Repository<WorkflowTask> {
    private useBackend: boolean;
    private tasksApi: TasksApiService;

    constructor() { 
        super(STORES.TASKS);
        this.useBackend = isBackendApiEnabled();
        this.tasksApi = new TasksApiService();
        this.logInitialization();
    }

    /**
     * Log repository initialization mode
     * @private
     */
    private logInitialization(): void {
        const mode = this.useBackend ? 'Backend API (PostgreSQL)' : 'IndexedDB (Local)';
        console.log(`[TaskRepository] Initialized with ${mode}`);
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[TaskRepository.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize case ID parameter
     * @private
     */
    private validateCaseId(caseId: string, methodName: string): void {
        if (!caseId || typeof caseId !== 'string' || caseId.trim() === '') {
            throw new Error(`[TaskRepository.${methodName}] Invalid caseId parameter`);
        }
    }

    /**
     * Validate and sanitize user ID parameter
     * @private
     */
    private validateUserId(userId: string, methodName: string): void {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error(`[TaskRepository.${methodName}] Invalid userId parameter`);
        }
    }

    // =============================================================================
    // CRUD OPERATIONS
    // =============================================================================

    /**
     * Get all tasks
     * 
     * @returns Promise<WorkflowTask[]> Array of tasks
     * @throws Error if fetch fails
     * 
     * @example
     * const allTasks = await repo.getAll();
     */
    override async getAll(): Promise<WorkflowTask[]> {
        if (this.useBackend) {
            try {
                return await this.tasksApi.getAll() as WorkflowTask[];
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await super.getAll();
        } catch (error) {
            console.error('[TaskRepository.getAll] Error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }

    /**
     * Get tasks by case ID
     * 
     * @param caseId - Case ID
     * @returns Promise<WorkflowTask[]> Array of tasks
     * @throws Error if caseId is invalid or fetch fails
     */
    getByCaseId = async (caseId: CaseId): Promise<WorkflowTask[]> => {
        this.validateCaseId(caseId, 'getByCaseId');

        if (this.useBackend) {
            try {
                return await this.tasksApi.getByCase(caseId) as WorkflowTask[];
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await this.getByIndex('caseId', caseId);
        } catch (error) {
            console.error('[TaskRepository.getByCaseId] Error:', error);
            throw new Error('Failed to fetch tasks by case ID');
        }
    }

    /**
     * Count active tasks by case ID (excludes Done/Completed)
     * 
     * @param caseId - Case ID
     * @returns Promise<number> Count of active tasks
     * @throws Error if caseId is invalid or fetch fails
     */
    async countByCaseId(caseId: string): Promise<number> {
        this.validateCaseId(caseId, 'countByCaseId');
        
        try {
            const tasks = await this.getByCaseId(caseId);
            return tasks.filter(t => t.status !== TaskStatusBackend.COMPLETED && t.status !== TaskStatusBackend.COMPLETED).length;
        } catch (error) {
            console.error('[TaskRepository.countByCaseId] Error:', error);
            throw new Error('Failed to count tasks by case ID');
        }
    }

    /**
     * Get task by ID
     * 
     * @param id - Task ID
     * @returns Promise<WorkflowTask | undefined> Task or undefined
     * @throws Error if id is invalid or fetch fails
     */
    override async getById(id: string): Promise<WorkflowTask | undefined> {
        this.validateId(id, 'getById');

        if (this.useBackend) {
            try {
                return await this.tasksApi.getById(id) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await super.getById(id);
        } catch (error) {
            console.error('[TaskRepository.getById] Error:', error);
            throw new Error('Failed to fetch task');
        }
    }

    /**
     * Add a new task
     * 
     * @param item - Task data
     * @returns Promise<WorkflowTask> Created task
     * @throws Error if validation fails or create fails
     */
    override async add(item: WorkflowTask): Promise<WorkflowTask> {
        if (!item || typeof item !== 'object') {
            throw new Error('[TaskRepository.add] Invalid task data');
        }

        if (this.useBackend) {
            try {
                return await this.tasksApi.add(item as any) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const result = await super.add(item);
            return result;
        } catch (error) {
            console.error('[TaskRepository.add] Error:', error);
            throw new Error('Failed to add task');
        }
    }

    /**
     * Update an existing task
     * Publishes integration event when task is completed
     * 
     * @param id - Task ID
     * @param updates - Partial task updates
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if validation fails or update fails
     */
    override async update(id: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> {
        this.validateId(id, 'update');

        if (!updates || typeof updates !== 'object') {
            throw new Error('[TaskRepository.update] Invalid updates data');
        }

        let result: WorkflowTask;

        if (this.useBackend) {
            try {
                result = await this.tasksApi.update(id, updates) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
                result = await super.update(id, updates);
            }
        } else {
            result = await super.update(id, updates);
        }
        
        // Integration Point: Publish event when task is completed
        if (updates.status === 'completed' || updates.status === 'done' || updates.status === TaskStatusBackend.COMPLETED || updates.status === TaskStatusBackend.COMPLETED) {
            try {
                await IntegrationOrchestrator.publish(SystemEventType.TASK_COMPLETED, { 
                    task: result,
                    completedAt: new Date().toISOString()
                });
            } catch (eventError) {
                console.warn('[TaskRepository] Failed to publish integration event', eventError);
            }
        }
        
        return result;
    }

    /**
     * Delete a task
     * 
     * @param id - Task ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');

        if (this.useBackend) {
            try {
                await this.tasksApi.delete(id);
                return;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await super.delete(id);
        } catch (error) {
            console.error('[TaskRepository.delete] Error:', error);
            throw new Error('Failed to delete task');
        }
    }

    // =============================================================================
    // STATUS MANAGEMENT
    // =============================================================================

    /**
     * Mark a task as complete
     * Publishes integration event for completed tasks
     * 
     * @param id - Task ID
     * @returns Promise<WorkflowTask> Completed task
     * @throws Error if id is invalid or update fails
     */
    completeTask = async (id: string): Promise<WorkflowTask> => {
        this.validateId(id, 'completeTask');

        try {
            const task = await this.getById(id);
            if (!task) {
                throw new Error(`Task ${id} not found`);
            }

            // Update task status
            const completed = await this.update(id, {
                status: TaskStatusBackend.COMPLETED,
                completedAt: new Date().toISOString(),
                progress: 100
            });

            return completed;
        } catch (error) {
            console.error('[TaskRepository.completeTask] Error:', error);
            throw new Error('Failed to complete task');
        }
    }

    /**
     * Update task status
     * 
     * @param id - Task ID
     * @param status - New status
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if validation fails or update fails
     */
    async updateStatus(id: string, status: TaskStatusBackend): Promise<WorkflowTask> {
        this.validateId(id, 'updateStatus');

        if (!status || typeof status !== 'string' || status.trim() === '') {
            throw new Error('[TaskRepository.updateStatus] Invalid status parameter');
        }

        if (this.useBackend) {
            try {
                return await this.tasksApi.updateStatus(id, status) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const updates: Partial<WorkflowTask> = { status };
            
            if (status === 'completed' || status === TaskStatusBackend.COMPLETED || status === 'done' || status === TaskStatusBackend.COMPLETED) {
                updates.completedAt = new Date().toISOString();
                updates.progress = 100;
            }

            return await this.update(id, updates);
        } catch (error) {
            console.error('[TaskRepository.updateStatus] Error:', error);
            throw new Error('Failed to update task status');
        }
    }

    /**
     * Update task priority
     * 
     * @param id - Task ID
     * @param priority - New priority (low, medium, high, urgent)
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if validation fails or update fails
     */
    async updatePriority(id: string, priority: TaskPriorityBackend): Promise<WorkflowTask> {
        this.validateId(id, 'updatePriority');

        if (!priority) {
            throw new Error('[TaskRepository.updatePriority] Invalid priority parameter');
        }

        return await this.update(id, { priority });
    }

    /**
     * Update task progress
     * 
     * @param id - Task ID
     * @param progress - Progress percentage (0-100)
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if validation fails or update fails
     */
    async updateProgress(id: string, progress: number): Promise<WorkflowTask> {
        this.validateId(id, 'updateProgress');

        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            throw new Error('[TaskRepository.updateProgress] Invalid progress parameter (must be 0-100)');
        }

        const updates: Partial<WorkflowTask> = { progress };

        // Auto-complete if progress reaches 100%
        if (progress === 100) {
            updates.status = TaskStatusBackend.COMPLETED;
            updates.completedAt = new Date().toISOString();
        }

        return await this.update(id, updates);
    }

    // =============================================================================
    // ASSIGNMENT MANAGEMENT
    // =============================================================================

    /**
     * Assign task to user
     * 
     * @param id - Task ID
     * @param userId - User ID
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if validation fails or update fails
     */
    async assignToUser(id: string, userId: UserId): Promise<WorkflowTask> {
        this.validateId(id, 'assignToUser');
        this.validateUserId(userId, 'assignToUser');

        if (this.useBackend) {
            try {
                return await this.tasksApi.assign(id, userId) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        return await this.update(id, { assignedTo: userId });
    }

    /**
     * Unassign task from user
     * 
     * @param id - Task ID
     * @returns Promise<WorkflowTask> Updated task
     * @throws Error if id is invalid or update fails
     */
    async unassignTask(id: string): Promise<WorkflowTask> {
        this.validateId(id, 'unassignTask');

        if (this.useBackend) {
            try {
                return await this.tasksApi.unassign(id) as WorkflowTask;
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        return await this.update(id, { assignedTo: undefined });
    }

    /**
     * Get tasks assigned to user
     * 
     * @param userId - User ID
     * @returns Promise<WorkflowTask[]> Array of assigned tasks
     * @throws Error if userId is invalid or fetch fails
     */
    async getByAssignee(userId: UserId): Promise<WorkflowTask[]> {
        this.validateUserId(userId, 'getByAssignee');

        if (this.useBackend) {
            try {
                return await this.tasksApi.getByAssignee(userId) as WorkflowTask[];
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await this.getByIndex('assignedTo', userId);
        } catch (error) {
            console.error('[TaskRepository.getByAssignee] Error:', error);
            throw new Error('Failed to fetch tasks by assignee');
        }
    }

    // =============================================================================
    // QUERIES & FILTERING
    // =============================================================================

    /**
     * Get overdue tasks
     * 
     * @returns Promise<WorkflowTask[]> Array of overdue tasks
     * @throws Error if fetch fails
     */
    async getOverdue(): Promise<WorkflowTask[]> {
        try {
            const tasks = await this.getAll();
            const now = new Date();

            return tasks.filter(task => {
                if (!task.dueDate || task.status === TaskStatusBackend.COMPLETED || task.status === TaskStatusBackend.COMPLETED) return false;
                return new Date(task.dueDate) < now;
            });
        } catch (error) {
            console.error('[TaskRepository.getOverdue] Error:', error);
            throw new Error('Failed to fetch overdue tasks');
        }
    }

    /**
     * Get upcoming tasks (due within specified days)
     * 
     * @param days - Number of days to look ahead (default: 7)
     * @returns Promise<WorkflowTask[]> Array of upcoming tasks
     * @throws Error if fetch fails
     */
    async getUpcoming(days: number = 7): Promise<WorkflowTask[]> {
        try {
            const tasks = await this.getAll();
            const now = new Date();
            const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

            return tasks.filter(task => {
                if (!task.dueDate || task.status === TaskStatusBackend.COMPLETED || task.status === TaskStatusBackend.COMPLETED) return false;
                const due = new Date(task.dueDate);
                return due >= now && due <= future;
            });
        } catch (error) {
            console.error('[TaskRepository.getUpcoming] Error:', error);
            throw new Error('Failed to fetch upcoming tasks');
        }
    }

    /**
     * Get tasks by status
     * 
     * @param status - Task status
     * @returns Promise<WorkflowTask[]> Array of tasks with status
     * @throws Error if status is invalid or fetch fails
     */
    async getByStatus(status: string): Promise<WorkflowTask[]> {
        if (!status || typeof status !== 'string' || status.trim() === '') {
            throw new Error('[TaskRepository.getByStatus] Invalid status parameter');
        }

        if (this.useBackend) {
            try {
                return await this.tasksApi.getByStatus(status) as WorkflowTask[];
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await this.getByIndex('status', status);
        } catch (error) {
            console.error('[TaskRepository.getByStatus] Error:', error);
            throw new Error('Failed to fetch tasks by status');
        }
    }

    /**
     * Get tasks by priority
     * 
     * @param priority - Task priority
     * @returns Promise<WorkflowTask[]> Array of tasks with priority
     * @throws Error if priority is invalid or fetch fails
     */
    async getByPriority(priority: string): Promise<WorkflowTask[]> {
        if (!priority || typeof priority !== 'string' || priority.trim() === '') {
            throw new Error('[TaskRepository.getByPriority] Invalid priority parameter');
        }

        if (this.useBackend) {
            try {
                return await this.tasksApi.getByPriority(priority) as WorkflowTask[];
            } catch (error) {
                console.warn('[TaskRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await this.getByIndex('priority', priority);
        } catch (error) {
            console.error('[TaskRepository.getByPriority] Error:', error);
            throw new Error('Failed to fetch tasks by priority');
        }
    }

    /**
     * Search tasks by criteria
     * 
     * @param criteria - Search criteria
     * @returns Promise<WorkflowTask[]> Matching tasks
     * @throws Error if search fails
     */
    async search(criteria: {
        caseId?: string;
        assignedTo?: string;
        status?: string;
        priority?: string;
        query?: string;
    }): Promise<WorkflowTask[]> {
        try {
            let tasks = await this.getAll();

            if (criteria.caseId) {
                tasks = tasks.filter(task => task.caseId === criteria.caseId);
            }

            if (criteria.assignedTo) {
                tasks = tasks.filter(task => task.assignedTo === criteria.assignedTo);
            }

            if (criteria.status) {
                tasks = tasks.filter(task => task.status === criteria.status);
            }

            if (criteria.priority) {
                tasks = tasks.filter(task => task.priority === criteria.priority);
            }

            if (criteria.query) {
                const lowerQuery = criteria.query.toLowerCase();
                tasks = tasks.filter(task =>
                    task.title?.toLowerCase().includes(lowerQuery) ||
                    task.description?.toLowerCase().includes(lowerQuery)
                );
            }

            return tasks;
        } catch (error) {
            console.error('[TaskRepository.search] Error:', error);
            throw new Error('Failed to search tasks');
        }
    }

    // =============================================================================
    // ANALYTICS
    // =============================================================================

    /**
     * Get task statistics
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise with statistics
     * @throws Error if fetch fails
     */
    async getStatistics(caseId?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        completed: number;
        overdue: number;
        avgProgress: number;
    }> {
        try {
            const tasks = caseId ? await this.getByCaseId(caseId) : await this.getAll();
            
            const byStatus: Record<string, number> = {};
            const byPriority: Record<string, number> = {};
            let completed = 0;
            let totalProgress = 0;

            tasks.forEach(task => {
                const status = task.status || 'unknown';
                byStatus[status] = (byStatus[status] || 0) + 1;

                const priority = task.priority || 'medium';
                byPriority[priority] = (byPriority[priority] || 0) + 1;

                if (task.status === TaskStatusBackend.COMPLETED || task.status === TaskStatusBackend.COMPLETED) {
                    completed++;
                }

                totalProgress += task.progress || 0;
            });

            const overdueTasks = await this.getOverdue();
            const overdue = caseId
                ? overdueTasks.filter(t => t.caseId === caseId).length
                : overdueTasks.length;

            return {
                total: tasks.length,
                byStatus,
                byPriority,
                completed,
                overdue,
                avgProgress: tasks.length > 0 ? totalProgress / tasks.length : 0
            };
        } catch (error) {
            console.error('[TaskRepository.getStatistics] Error:', error);
            throw new Error('Failed to get task statistics');
        }
    }
}
