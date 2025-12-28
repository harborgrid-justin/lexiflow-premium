/**
 * @file workflow-advanced-api.ts
 * @description Elite workflow API service with 10 integrated advanced features
 * @architecture Frontend API layer connecting to NestJS backend
 * @integration DataService facade pattern for seamless backend/local routing
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type {
  EnhancedWorkflowInstance,
  ConditionalBranchingConfig,
  ParallelExecutionConfig,
  WorkflowVersion,
  WorkflowDiff,
  WorkflowTemplate,
  SLAConfig,
  SLAStatus,
  ApprovalChain,
  ApprovalInstance,
  ApprovalDecision,
  WorkflowSnapshot,
  RollbackOperation,
  WorkflowAnalytics,
  AIWorkflowSuggestion,
  AILearningFeedback,
  ExternalTrigger,
  TriggerEvent,
  WorkflowQueryFilters,
  WorkflowSortOptions,
} from '@/types/workflow-advanced-types';

/**
 * Advanced Workflow API Service
 * Provides enterprise-grade workflow automation with 10 elite features
 */
export class WorkflowAdvancedApiService {
  private readonly baseUrl = '/workflow/advanced';

  // ============================================================================
  // FEATURE 1: CONDITIONAL BRANCHING ENGINE
  // ============================================================================

  /**
   * Create conditional branching configuration for a workflow node
   */
  async createConditionalBranching(
    workflowId: string,
    config: ConditionalBranchingConfig,
  ): Promise<ConditionalBranchingConfig> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/conditional`, config);
  }

  /**
   * Evaluate conditional rules for a specific context
   */
  async evaluateConditionalBranching(
    workflowId: string,
    nodeId: string,
    context: Record<string, any>,
  ): Promise<{ branchId: string; matched: boolean; evaluationTime: number }> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/conditional/${nodeId}/evaluate`, { context });
  }

  /**
   * Update conditional branching configuration
   */
  async updateConditionalBranching(
    workflowId: string,
    configId: string,
    updates: Partial<ConditionalBranchingConfig>,
  ): Promise<ConditionalBranchingConfig> {
    return apiClient.patch(`${this.baseUrl}/${workflowId}/conditional/${configId}`, updates);
  }

  /**
   * Delete conditional branching configuration
   */
  async deleteConditionalBranching(workflowId: string, configId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${workflowId}/conditional/${configId}`);
  }

  /**
   * Test conditional rules with sample data
   */
  async testConditionalRules(
    workflowId: string,
    config: ConditionalBranchingConfig,
    testCases: Array<{ input: Record<string, any>; expectedBranch: string }>,
  ): Promise<Array<{ input: Record<string, any>; actualBranch: string; passed: boolean }>> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/conditional/test`, { config, testCases });
  }

  // ============================================================================
  // FEATURE 2: PARALLEL EXECUTION SYSTEM
  // ============================================================================

  /**
   * Create parallel execution configuration
   */
  async createParallelExecution(
    workflowId: string,
    config: ParallelExecutionConfig,
  ): Promise<ParallelExecutionConfig> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/parallel`, config);
  }

  /**
   * Execute parallel branches
   */
  async executeParallelBranches(
    workflowId: string,
    configId: string,
    context: Record<string, any>,
  ): Promise<{
    completedBranches: string[];
    failedBranches: string[];
    executionTime: number;
    metrics: Record<string, any>;
  }> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/parallel/${configId}/execute`, { context });
  }

  /**
   * Get parallel execution metrics
   */
  async getParallelExecutionMetrics(
    workflowId: string,
    configId: string,
  ): Promise<{
    totalExecutions: number;
    averageDuration: number;
    successRate: number;
    branchMetrics: Record<string, any>;
  }> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/parallel/${configId}/metrics`);
  }

  /**
   * Update parallel execution configuration
   */
  async updateParallelExecution(
    workflowId: string,
    configId: string,
    updates: Partial<ParallelExecutionConfig>,
  ): Promise<ParallelExecutionConfig> {
    return apiClient.patch(`${this.baseUrl}/${workflowId}/parallel/${configId}`, updates);
  }

  // ============================================================================
  // FEATURE 3: WORKFLOW VERSIONING
  // ============================================================================

  /**
   * Create new workflow version with semantic versioning
   */
  async createVersion(
    workflowId: string,
    versionData: Partial<WorkflowVersion>,
  ): Promise<WorkflowVersion> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/versions`, versionData);
  }

  /**
   * Get all versions for a workflow
   */
  async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/versions`);
  }

  /**
   * Get specific version
   */
  async getVersion(workflowId: string, versionId: string): Promise<WorkflowVersion> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/versions/${versionId}`);
  }

  /**
   * Compare two versions and generate diff
   */
  async compareVersions(
    workflowId: string,
    versionA: string,
    versionB: string,
  ): Promise<WorkflowDiff> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/versions/compare`, {
      params: { versionA, versionB },
    });
  }

  /**
   * Rollback to specific version
   */
  async rollbackToVersion(workflowId: string, versionId: string): Promise<EnhancedWorkflowInstance> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/versions/${versionId}/rollback`);
  }

  /**
   * Publish version
   */
  async publishVersion(workflowId: string, versionId: string): Promise<WorkflowVersion> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/versions/${versionId}/publish`);
  }

  /**
   * Deprecate version
   */
  async deprecateVersion(
    workflowId: string,
    versionId: string,
    reason: string,
  ): Promise<WorkflowVersion> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/versions/${versionId}/deprecate`, { reason });
  }

  // ============================================================================
  // FEATURE 4: TEMPLATE LIBRARY 2.0
  // ============================================================================

  /**
   * Search templates with AI-powered categorization
   */
  async searchTemplates(query: {
    search?: string;
    categories?: string[];
    tags?: string[];
    complexity?: string;
    practiceAreas?: string[];
    jurisdiction?: string[];
    minRating?: number;
    certified?: boolean;
  }): Promise<WorkflowTemplate[]> {
    return apiClient.get(`${this.baseUrl}/templates/search`, { params: query });
  }

  /**
   * Get AI-suggested categories for a template
   */
  async getAICategories(templateId: string): Promise<Array<{ category: string; confidence: number }>> {
    return apiClient.get(`${this.baseUrl}/templates/${templateId}/ai-categories`);
  }

  /**
   * Fork a template
   */
  async forkTemplate(templateId: string, name: string): Promise<WorkflowTemplate> {
    return apiClient.post(`${this.baseUrl}/templates/${templateId}/fork`, { name });
  }

  /**
   * Rate and review template
   */
  async rateTemplate(
    templateId: string,
    rating: number,
    comment?: string,
  ): Promise<WorkflowTemplate> {
    return apiClient.post(`${this.baseUrl}/templates/${templateId}/rate`, { rating, comment });
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(templateId: string): Promise<{
    usageCount: number;
    averageRating: number;
    forkCount: number;
    favoriteCount: number;
    categoryDistribution: Record<string, number>;
  }> {
    return apiClient.get(`${this.baseUrl}/templates/${templateId}/analytics`);
  }

  // ============================================================================
  // FEATURE 5: SLA MONITORING DASHBOARD
  // ============================================================================

  /**
   * Create SLA configuration for workflow
   */
  async createSLA(workflowId: string, config: Partial<SLAConfig>): Promise<SLAConfig> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/sla`, config);
  }

  /**
   * Get SLA configurations
   */
  async getSLAConfigs(workflowId: string): Promise<SLAConfig[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/sla`);
  }

  /**
   * Calculate SLA status for a node
   */
  async calculateSLAStatus(
    workflowId: string,
    nodeId: string,
    slaConfigId: string,
  ): Promise<SLAStatus> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/sla/${slaConfigId}/status/${nodeId}`);
  }

  /**
   * Get SLA dashboard metrics
   */
  async getSLADashboard(workflowId: string): Promise<{
    totalNodes: number;
    onTrack: number;
    atRisk: number;
    breached: number;
    complianceRate: number;
    activeEscalations: number;
    slaStatuses: SLAStatus[];
  }> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/sla/dashboard`);
  }

  /**
   * Pause SLA tracking
   */
  async pauseSLA(workflowId: string, nodeId: string, reason: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/sla/pause/${nodeId}`, { reason });
  }

  /**
   * Resume SLA tracking
   */
  async resumeSLA(workflowId: string, nodeId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/sla/resume/${nodeId}`);
  }

  // ============================================================================
  // FEATURE 6: APPROVAL CHAINS
  // ============================================================================

  /**
   * Create approval chain
   */
  async createApprovalChain(
    workflowId: string,
    chain: Partial<ApprovalChain>,
  ): Promise<ApprovalChain> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/approvals`, chain);
  }

  /**
   * Get approval chains
   */
  async getApprovalChains(workflowId: string): Promise<ApprovalChain[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/approvals`);
  }

  /**
   * Get approval instance
   */
  async getApprovalInstance(workflowId: string, instanceId: string): Promise<ApprovalInstance> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}`);
  }

  /**
   * Submit approval decision
   */
  async submitApprovalDecision(
    workflowId: string,
    instanceId: string,
    decision: Partial<ApprovalDecision>,
  ): Promise<{ approved: boolean; chainComplete: boolean }> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}/decide`, decision);
  }

  /**
   * Delegate approval
   */
  async delegateApproval(
    workflowId: string,
    instanceId: string,
    toUserId: string,
    reason?: string,
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}/delegate`, {
      toUserId,
      reason,
    });
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(userId: string): Promise<ApprovalInstance[]> {
    return apiClient.get(`${this.baseUrl}/approvals/pending`, { params: { userId } });
  }

  // ============================================================================
  // FEATURE 7: ROLLBACK MECHANISM
  // ============================================================================

  /**
   * Create workflow snapshot
   */
  async createSnapshot(
    workflowId: string,
    data: { type: 'manual' | 'milestone' | 'scheduled'; label?: string; description?: string },
  ): Promise<WorkflowSnapshot> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/snapshots`, data);
  }

  /**
   * Get workflow snapshots
   */
  async getSnapshots(workflowId: string): Promise<WorkflowSnapshot[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/snapshots`);
  }

  /**
   * Get specific snapshot
   */
  async getSnapshot(workflowId: string, snapshotId: string): Promise<WorkflowSnapshot> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/snapshots/${snapshotId}`);
  }

  /**
   * Rollback to snapshot
   */
  async rollback(
    workflowId: string,
    snapshotId: string,
    strategy: 'full' | 'partial' | 'compensating' = 'full',
    dryRun: boolean = false,
  ): Promise<RollbackOperation> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/snapshots/${snapshotId}/rollback`, {
      strategy,
      dryRun,
    });
  }

  /**
   * Delete snapshot
   */
  async deleteSnapshot(workflowId: string, snapshotId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${workflowId}/snapshots/${snapshotId}`);
  }

  /**
   * Auto-snapshot configuration
   */
  async configureAutoSnapshots(
    workflowId: string,
    config: {
      enabled: boolean;
      interval?: number;
      maxSnapshots?: number;
      retentionDays?: number;
    },
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/snapshots/auto-config`, config);
  }

  // ============================================================================
  // FEATURE 8: WORKFLOW ANALYTICS ENGINE
  // ============================================================================

  /**
   * Get comprehensive workflow analytics
   */
  async getAnalytics(
    workflowId: string,
    options: {
      start: string;
      end: string;
      includeBottlenecks?: boolean;
      includeSuggestions?: boolean;
      includeTrends?: boolean;
    },
  ): Promise<WorkflowAnalytics> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/analytics`, { params: options });
  }

  /**
   * Get real-time workflow metrics
   */
  async getRealTimeMetrics(workflowId: string): Promise<{
    activeInstances: number;
    completedToday: number;
    averageDuration: number;
    currentBottlenecks: string[];
  }> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/analytics/realtime`);
  }

  /**
   * Get node-specific analytics
   */
  async getNodeAnalytics(workflowId: string, nodeId: string): Promise<{
    executionCount: number;
    averageDuration: number;
    failureRate: number;
    waitTime: number;
    throughput: number;
  }> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/analytics/nodes/${nodeId}`);
  }

  /**
   * Export analytics report
   */
  async exportAnalytics(
    workflowId: string,
    format: 'pdf' | 'excel' | 'csv',
    dateRange: { start: string; end: string },
  ): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/analytics/export`, {
      params: { format, ...dateRange },
      responseType: 'blob',
    });
  }

  // ============================================================================
  // FEATURE 9: AI-POWERED SUGGESTIONS
  // ============================================================================

  /**
   * Get AI-powered workflow suggestions
   */
  async getAISuggestions(
    workflowId: string,
    options?: { minConfidence?: number; types?: string[] },
  ): Promise<AIWorkflowSuggestion[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/ai/suggestions`, { params: options });
  }

  /**
   * Apply AI suggestion
   */
  async applyAISuggestion(workflowId: string, suggestionId: string): Promise<EnhancedWorkflowInstance> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/ai/suggestions/${suggestionId}/apply`);
  }

  /**
   * Provide feedback on AI suggestion
   */
  async provideSuggestionFeedback(
    workflowId: string,
    suggestionId: string,
    feedback: Partial<AILearningFeedback>,
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/ai/suggestions/${suggestionId}/feedback`, feedback);
  }

  /**
   * Trigger AI analysis
   */
  async triggerAIAnalysis(workflowId: string): Promise<{ jobId: string; estimatedTime: number }> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/ai/analyze`);
  }

  /**
   * Get AI analysis status
   */
  async getAIAnalysisStatus(workflowId: string, jobId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    results?: AIWorkflowSuggestion[];
  }> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/ai/analyze/${jobId}`);
  }

  // ============================================================================
  // FEATURE 10: EXTERNAL TRIGGERS
  // ============================================================================

  /**
   * Create external trigger
   */
  async createExternalTrigger(
    workflowId: string,
    config: Partial<ExternalTrigger>,
  ): Promise<ExternalTrigger> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/triggers`, config);
  }

  /**
   * Get external triggers
   */
  async getExternalTriggers(workflowId: string): Promise<ExternalTrigger[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/triggers`);
  }

  /**
   * Update external trigger
   */
  async updateExternalTrigger(
    workflowId: string,
    triggerId: string,
    updates: Partial<ExternalTrigger>,
  ): Promise<ExternalTrigger> {
    return apiClient.patch(`${this.baseUrl}/${workflowId}/triggers/${triggerId}`, updates);
  }

  /**
   * Enable/disable external trigger
   */
  async toggleExternalTrigger(workflowId: string, triggerId: string, enabled: boolean): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/triggers/${triggerId}/toggle`, { enabled });
  }

  /**
   * Test external trigger
   */
  async testExternalTrigger(
    workflowId: string,
    triggerId: string,
    payload: Record<string, any>,
  ): Promise<TriggerEvent> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/triggers/${triggerId}/test`, { payload });
  }

  /**
   * Get trigger events
   */
  async getTriggerEvents(
    workflowId: string,
    triggerId: string,
    limit: number = 50,
  ): Promise<TriggerEvent[]> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/triggers/${triggerId}/events`, { params: { limit } });
  }

  /**
   * Delete external trigger
   */
  async deleteExternalTrigger(workflowId: string, triggerId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${workflowId}/triggers/${triggerId}`);
  }

  // ============================================================================
  // ENHANCED WORKFLOW INSTANCE OPERATIONS
  // ============================================================================

  /**
   * Get enhanced workflow instance with all features
   */
  async getEnhanced(workflowId: string): Promise<EnhancedWorkflowInstance> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/enhanced`);
  }

  /**
   * Create enhanced workflow instance
   */
  async createEnhanced(data: Partial<EnhancedWorkflowInstance>): Promise<EnhancedWorkflowInstance> {
    return apiClient.post(`${this.baseUrl}/enhanced`, data);
  }

  /**
   * Update enhanced workflow instance
   */
  async updateEnhanced(
    workflowId: string,
    updates: Partial<EnhancedWorkflowInstance>,
  ): Promise<EnhancedWorkflowInstance> {
    return apiClient.patch(`${this.baseUrl}/${workflowId}/enhanced`, updates);
  }

  /**
   * Query enhanced workflows with advanced filters
   */
  async queryEnhanced(
    filters: WorkflowQueryFilters,
    sort?: WorkflowSortOptions,
    pagination?: { page: number; limit: number },
  ): Promise<{
    data: EnhancedWorkflowInstance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiClient.post(`${this.baseUrl}/enhanced/query`, { filters, sort, pagination });
  }

  /**
   * Execute workflow with all features enabled
   */
  async executeEnhanced(
    workflowId: string,
    input?: Record<string, any>,
    options?: {
      dryRun?: boolean;
      enableSnapshots?: boolean;
      enableSLA?: boolean;
      enableAI?: boolean;
    },
  ): Promise<{
    instanceId: string;
    status: string;
    estimatedCompletion: string;
  }> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/execute`, { input, options });
  }

  /**
   * Pause workflow execution
   */
  async pauseWorkflow(workflowId: string, reason?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/pause`, { reason });
  }

  /**
   * Resume workflow execution
   */
  async resumeWorkflow(workflowId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/resume`);
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflow(workflowId: string, reason?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/cancel`, { reason });
  }

  /**
   * Clone workflow with all configurations
   */
  async cloneWorkflow(workflowId: string, name: string): Promise<EnhancedWorkflowInstance> {
    return apiClient.post(`${this.baseUrl}/${workflowId}/clone`, { name });
  }

  /**
   * Export workflow configuration
   */
  async exportWorkflow(workflowId: string, format: 'json' | 'yaml' | 'bpmn'): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/${workflowId}/export`, {
      params: { format },
      responseType: 'blob',
    });
  }

  /**
   * Import workflow configuration
   */
  async importWorkflow(file: File, format: 'json' | 'yaml' | 'bpmn'): Promise<EnhancedWorkflowInstance> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    return apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

// Export singleton instance
export const workflowAdvancedApi = new WorkflowAdvancedApiService();
