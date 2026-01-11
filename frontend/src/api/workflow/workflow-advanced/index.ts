/**
 * Workflow Advanced API Module - Barrel Export
 * Clean import paths for all advanced workflow functionality
 */

// Export main service
export { WorkflowAdvancedApiService, workflowAdvancedApi } from "./workflow-advanced-api";

// Re-export individual feature modules for granular access
export * as ConditionalBranchingApi from "./conditional-branching-api";
export * as ParallelExecutionApi from "./parallel-execution-api";
export * as VersioningApi from "./versioning-api";
export * as TemplateLibraryApi from "./template-library-api";
export * as SLAMonitoringApi from "./sla-monitoring-api";
export * as ApprovalChainsApi from "./approval-chains-api";
export * as RollbackApi from "./rollback-api";
export * as AnalyticsApi from "./analytics-api";
export * as AISuggestionsApi from "./ai-suggestions-api";
export * as ExternalTriggersApi from "./external-triggers-api";
export * as EnhancedOperationsApi from "./enhanced-operations-api";

// Types are imported from @/types/workflow-advanced-types
