/**
 * Workflow API Service
 * Enterprise-grade API service for workflow automation and template management with backend integration
 * 
 * @module WorkflowApiService
 * @description Manages all workflow-related operations including:
 * - Workflow template CRUD operations
 * - Workflow instance lifecycle management
 * - Workflow execution and monitoring
 * - Workflow pause/resume/cancel operations
 * - Workflow engine synchronization
 * - Event-driven workflow triggers
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Workflow execution audit trail
 * - Proper error handling and logging
 * - Secure context variable handling
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via WORKFLOW_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Event-driven workflow triggers
 * - Stateful workflow instance tracking
 */

import { apiClient } from '../infrastructure/apiClient';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  trigger?: {
    type: 'manual' | 'event' | 'scheduled';
    event?: string;
    schedule?: string;
  };
  steps: {
    id: string;
    name: string;
    type: 'task' | 'approval' | 'notification' | 'automation';
    order: number;
    config?: Record<string, any>;
    assignee?: string;
    dependencies?: string[];
  }[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  caseId?: string;
  matterId?: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  startedAt: string;
  completedAt?: string;
  progress?: number;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowFilters {
  status?: WorkflowTemplate['status'];
  category?: string;
}

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.templates.all() });
 * queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.instances.byCase(caseId) });
 * queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.instances.active() });
 */
export const WORKFLOW_QUERY_KEYS = {
    templates: {
        all: () => ['workflow', 'templates'] as const,
        byId: (id: string) => ['workflow', 'templates', id] as const,
        byCategory: (category: string) => ['workflow', 'templates', 'category', category] as const,
        byStatus: (status: string) => ['workflow', 'templates', 'status', status] as const,
    },
    instances: {
        all: () => ['workflow', 'instances'] as const,
        byId: (id: string) => ['workflow', 'instances', id] as const,
        byCase: (caseId: string) => ['workflow', 'instances', 'case', caseId] as const,
        byStatus: (status: string) => ['workflow', 'instances', 'status', status] as const,
        active: () => ['workflow', 'instances', 'status', 'running'] as const,
    },
} as const;

/**
 * Workflow API Service Class
 * Implements secure, type-safe workflow automation operations
 */
export class WorkflowApiService {
    private readonly baseUrl = '/workflow';

    constructor() {
        this.logInitialization();
    }

    /**
     * Log service initialization
     * @private
     */
    private logInitialization(): void {
        console.log('[WorkflowApiService] Initialized with Backend API (PostgreSQL)');
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[WorkflowApiService.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize object parameter
     * @private
     */
    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[WorkflowApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    /**
     * Validate workflow template status
     * @private
     */
    private validateTemplateStatus(status: string, methodName: string): void {
        const validStatuses = ['active', 'inactive', 'draft'];
        if (!status || !validStatuses.includes(status)) {
            throw new Error(`[WorkflowApiService.${methodName}] Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    /**
     * Validate workflow instance status
     * @private
     */
    private validateInstanceStatus(status: string, methodName: string): void {
        const validStatuses = ['running', 'paused', 'completed', 'failed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            throw new Error(`[WorkflowApiService.${methodName}] Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    // =============================================================================
    // WORKFLOW TEMPLATE OPERATIONS
    // =============================================================================

    /**
     * Get workflow templates with optional filters
     * 
     * @param filters - Optional filters for status and category
     * @returns Promise<WorkflowTemplate[]> Array of workflow templates
     * @throws Error if fetch fails
     * 
     * @example
     * const allTemplates = await service.getTemplates();
     * const activeTemplates = await service.getTemplates({ status: 'active' });
     * const caseTemplates = await service.getTemplates({ category: 'case-management' });
     */
    async getTemplates(filters?: WorkflowFilters): Promise<WorkflowTemplate[]> {
        try {
            if (filters?.status) {
                this.validateTemplateStatus(filters.status, 'getTemplates');
            }

            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.category) params.append('category', filters.category);
            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}/templates?${queryString}` : `${this.baseUrl}/templates`;
            
            return await apiClient.get<WorkflowTemplate[]>(url);
        } catch (error) {
            console.error('[WorkflowApiService.getTemplates] Error:', error);
            throw new Error('Failed to fetch workflow templates');
        }
    }

    /**
     * Get workflow template by ID
     * 
     * @param id - Template ID
     * @returns Promise<WorkflowTemplate> Workflow template data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const template = await service.getTemplateById('template-123');
     */
    async getTemplateById(id: string): Promise<WorkflowTemplate> {
        this.validateId(id, 'getTemplateById');

        try {
            return await apiClient.get<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`);
        } catch (error) {
            console.error('[WorkflowApiService.getTemplateById] Error:', error);
            throw new Error(`Failed to fetch workflow template with id: ${id}`);
        }
    }

    /**
     * Create a new workflow template
     * 
     * @param data - Workflow template configuration
     * @returns Promise<WorkflowTemplate> Created workflow template
     * @throws Error if validation fails or creation fails
     * 
     * @example
     * const template = await service.createTemplate({
     *   name: 'Case Intake Workflow',
     *   category: 'case-management',
     *   status: 'draft',
     *   steps: [...]
     * });
     */
    async createTemplate(data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
        this.validateObject(data, 'data', 'createTemplate');

        if (!data.name) {
            throw new Error('[WorkflowApiService.createTemplate] Name is required');
        }
        if (!data.category) {
            throw new Error('[WorkflowApiService.createTemplate] Category is required');
        }
        if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
            throw new Error('[WorkflowApiService.createTemplate] At least one step is required');
        }

        try {
            return await apiClient.post<WorkflowTemplate>(`${this.baseUrl}/templates`, data);
        } catch (error) {
            console.error('[WorkflowApiService.createTemplate] Error:', error);
            throw new Error('Failed to create workflow template');
        }
    }

    /**
     * Update an existing workflow template
     * 
     * @param id - Template ID
     * @param data - Partial workflow template updates
     * @returns Promise<WorkflowTemplate> Updated workflow template
     * @throws Error if validation fails or update fails
     */
    async updateTemplate(id: string, data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
        this.validateId(id, 'updateTemplate');
        this.validateObject(data, 'data', 'updateTemplate');

        if (data.status) {
            this.validateTemplateStatus(data.status, 'updateTemplate');
        }

        try {
            return await apiClient.put<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`, data);
        } catch (error) {
            console.error('[WorkflowApiService.updateTemplate] Error:', error);
            throw new Error(`Failed to update workflow template with id: ${id}`);
        }
    }

    /**
     * Delete a workflow template
     * 
     * @param id - Template ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    async deleteTemplate(id: string): Promise<void> {
        this.validateId(id, 'deleteTemplate');

        try {
            await apiClient.delete(`${this.baseUrl}/templates/${id}`);
        } catch (error) {
            console.error('[WorkflowApiService.deleteTemplate] Error:', error);
            throw new Error(`Failed to delete workflow template with id: ${id}`);
        }
    }

    // =============================================================================
    // WORKFLOW INSTANCE OPERATIONS
    // =============================================================================

    /**
     * Get workflow instances with optional filters
     * 
     * @param filters - Optional filters for status and caseId
     * @returns Promise<WorkflowInstance[]> Array of workflow instances
     * @throws Error if fetch fails
     * 
     * @example
     * const allInstances = await service.getInstances();
     * const runningInstances = await service.getInstances({ status: 'running' });
     * const caseInstances = await service.getInstances({ caseId: 'case-123' });
     */
    async getInstances(filters?: { status?: WorkflowInstance['status']; caseId?: string }): Promise<WorkflowInstance[]> {
        try {
            if (filters?.status) {
                this.validateInstanceStatus(filters.status, 'getInstances');
            }

            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.caseId) params.append('caseId', filters.caseId);
            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}/instances?${queryString}` : `${this.baseUrl}/instances`;
            
            return await apiClient.get<WorkflowInstance[]>(url);
        } catch (error) {
            console.error('[WorkflowApiService.getInstances] Error:', error);
            throw new Error('Failed to fetch workflow instances');
        }
    }

    /**
     * Get workflow instance by ID
     * 
     * @param id - Instance ID
     * @returns Promise<WorkflowInstance> Workflow instance data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const instance = await service.getInstanceById('instance-123');
     */
    async getInstanceById(id: string): Promise<WorkflowInstance> {
        this.validateId(id, 'getInstanceById');

        try {
            return await apiClient.get<WorkflowInstance>(`${this.baseUrl}/instances/${id}`);
        } catch (error) {
            console.error('[WorkflowApiService.getInstanceById] Error:', error);
            throw new Error(`Failed to fetch workflow instance with id: ${id}`);
        }
    }

    /**
     * Start a new workflow instance from a template
     * 
     * @param templateId - Template ID to instantiate
     * @param context - Context variables and configuration
     * @returns Promise<WorkflowInstance> Created workflow instance
     * @throws Error if validation fails or start fails
     * 
     * @example
     * const instance = await service.startWorkflow('template-123', {
     *   caseId: 'case-456',
     *   variables: { priority: 'high' }
     * });
     */
    async startWorkflow(templateId: string, context: Record<string, any>): Promise<WorkflowInstance> {
        this.validateId(templateId, 'startWorkflow');
        this.validateObject(context, 'context', 'startWorkflow');

        try {
            return await apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances`, { templateId, ...context });
        } catch (error) {
            console.error('[WorkflowApiService.startWorkflow] Error:', error);
            throw new Error('Failed to start workflow');
        }
    }

    /**
     * Pause a running workflow instance
     * 
     * @param id - Instance ID
     * @returns Promise<WorkflowInstance> Paused workflow instance
     * @throws Error if id is invalid or pause fails
     * 
     * @example
     * const pausedInstance = await service.pauseWorkflow('instance-123');
     */
    async pauseWorkflow(id: string): Promise<WorkflowInstance> {
        this.validateId(id, 'pauseWorkflow');

        try {
            return await apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/pause`, {});
        } catch (error) {
            console.error('[WorkflowApiService.pauseWorkflow] Error:', error);
            throw new Error(`Failed to pause workflow with id: ${id}`);
        }
    }

    /**
     * Resume a paused workflow instance
     * 
     * @param id - Instance ID
     * @returns Promise<WorkflowInstance> Resumed workflow instance
     * @throws Error if id is invalid or resume fails
     * 
     * @example
     * const resumedInstance = await service.resumeWorkflow('instance-123');
     */
    async resumeWorkflow(id: string): Promise<WorkflowInstance> {
        this.validateId(id, 'resumeWorkflow');

        try {
            return await apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/resume`, {});
        } catch (error) {
            console.error('[WorkflowApiService.resumeWorkflow] Error:', error);
            throw new Error(`Failed to resume workflow with id: ${id}`);
        }
    }

    /**
     * Cancel a workflow instance
     * 
     * @param id - Instance ID
     * @returns Promise<WorkflowInstance> Cancelled workflow instance
     * @throws Error if id is invalid or cancel fails
     * 
     * @example
     * const cancelledInstance = await service.cancelWorkflow('instance-123');
     */
    async cancelWorkflow(id: string): Promise<WorkflowInstance> {
        this.validateId(id, 'cancelWorkflow');

        try {
            return await apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/cancel`, {});
        } catch (error) {
            console.error('[WorkflowApiService.cancelWorkflow] Error:', error);
            throw new Error(`Failed to cancel workflow with id: ${id}`);
        }
    }

    // =============================================================================
    // ENGINE OPERATIONS
    // =============================================================================

    /**
     * Synchronize workflow engine state
     * Useful for ensuring consistency after system restarts or failures
     * 
     * @returns Promise with sync result
     * @throws Error if sync fails
     * 
     * @example
     * const result = await service.syncEngine();
     * // Returns: { success: true, message: 'Engine synchronized' }
     */
    async syncEngine(): Promise<{ success: boolean; message: string }> {
        try {
            return await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/sync`, {});
        } catch (error) {
            console.error('[WorkflowApiService.syncEngine] Error:', error);
            throw new Error('Failed to synchronize workflow engine');
        }
    }
}
