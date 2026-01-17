/**
 * Workflow Advanced API Service
 * Main service class aggregating all 10 advanced workflow features
 */

import * as AISuggestionsApi from "./ai-suggestions-api";
import * as AnalyticsApi from "./analytics-api";
import * as ApprovalChainsApi from "./approval-chains-api";
import * as ConditionalBranchingApi from "./conditional-branching-api";
import * as EnhancedOperationsApi from "./enhanced-operations-api";
import * as ExternalTriggersApi from "./external-triggers-api";
import * as ParallelExecutionApi from "./parallel-execution-api";
import * as RollbackApi from "./rollback-api";
import * as SLAMonitoringApi from "./sla-monitoring-api";
import * as TemplateLibraryApi from "./template-library-api";
import * as VersioningApi from "./versioning-api";

/**
 * Advanced Workflow API Service
 * Enterprise-grade workflow automation with 10 elite features
 */
export class WorkflowAdvancedApiService {
  // Feature 1: Conditional Branching
  public createConditionalBranching = ConditionalBranchingApi.createConditionalBranching;
  public evaluateConditionalBranching = ConditionalBranchingApi.evaluateConditionalBranching;
  public updateConditionalBranching = ConditionalBranchingApi.updateConditionalBranching;
  public deleteConditionalBranching = ConditionalBranchingApi.deleteConditionalBranching;
  public testConditionalRules = ConditionalBranchingApi.testConditionalRules;

  // Feature 2: Parallel Execution
  public createParallelExecution = ParallelExecutionApi.createParallelExecution;
  public executeParallelBranches = ParallelExecutionApi.executeParallelBranches;
  public getParallelExecutionMetrics = ParallelExecutionApi.getParallelExecutionMetrics;
  public updateParallelExecution = ParallelExecutionApi.updateParallelExecution;

  // Feature 3: Versioning
  public createVersion = VersioningApi.createVersion;
  public getVersions = VersioningApi.getVersions;
  public getVersion = VersioningApi.getVersion;
  public compareVersions = VersioningApi.compareVersions;
  public rollbackToVersion = VersioningApi.rollbackToVersion;
  public publishVersion = VersioningApi.publishVersion;
  public deprecateVersion = VersioningApi.deprecateVersion;

  // Feature 4: Template Library
  public searchTemplates = TemplateLibraryApi.searchTemplates;
  public getAICategories = TemplateLibraryApi.getAICategories;
  public forkTemplate = TemplateLibraryApi.forkTemplate;
  public rateTemplate = TemplateLibraryApi.rateTemplate;
  public getTemplateAnalytics = TemplateLibraryApi.getTemplateAnalytics;

  // Feature 5: SLA Monitoring
  public createSLA = SLAMonitoringApi.createSLA;
  public getSLAConfigs = SLAMonitoringApi.getSLAConfigs;
  public calculateSLAStatus = SLAMonitoringApi.calculateSLAStatus;
  public getSLADashboard = SLAMonitoringApi.getSLADashboard;
  public pauseSLA = SLAMonitoringApi.pauseSLA;
  public resumeSLA = SLAMonitoringApi.resumeSLA;

  // Feature 6: Approval Chains
  public createApprovalChain = ApprovalChainsApi.createApprovalChain;
  public getApprovalChains = ApprovalChainsApi.getApprovalChains;
  public getApprovalInstance = ApprovalChainsApi.getApprovalInstance;
  public submitApprovalDecision = ApprovalChainsApi.submitApprovalDecision;
  public delegateApproval = ApprovalChainsApi.delegateApproval;
  public getPendingApprovals = ApprovalChainsApi.getPendingApprovals;

  // Feature 7: Rollback
  public createSnapshot = RollbackApi.createSnapshot;
  public getSnapshots = RollbackApi.getSnapshots;
  public getSnapshot = RollbackApi.getSnapshot;
  public rollback = RollbackApi.rollback;
  public deleteSnapshot = RollbackApi.deleteSnapshot;
  public configureAutoSnapshots = RollbackApi.configureAutoSnapshots;

  // Feature 8: Analytics
  public getAnalytics = AnalyticsApi.getAnalytics;
  public getRealTimeMetrics = AnalyticsApi.getRealTimeMetrics;
  public getNodeAnalytics = AnalyticsApi.getNodeAnalytics;
  public exportAnalytics = AnalyticsApi.exportAnalytics;

  // Feature 9: AI Suggestions
  public getAISuggestions = AISuggestionsApi.getAISuggestions;
  public applyAISuggestion = AISuggestionsApi.applyAISuggestion;
  public provideSuggestionFeedback = AISuggestionsApi.provideSuggestionFeedback;
  public triggerAIAnalysis = AISuggestionsApi.triggerAIAnalysis;
  public getAIAnalysisStatus = AISuggestionsApi.getAIAnalysisStatus;

  // Feature 10: External Triggers
  public createExternalTrigger = ExternalTriggersApi.createExternalTrigger;
  public getExternalTriggers = ExternalTriggersApi.getExternalTriggers;
  public updateExternalTrigger = ExternalTriggersApi.updateExternalTrigger;
  public toggleExternalTrigger = ExternalTriggersApi.toggleExternalTrigger;
  public testExternalTrigger = ExternalTriggersApi.testExternalTrigger;
  public getTriggerEvents = ExternalTriggersApi.getTriggerEvents;
  public deleteExternalTrigger = ExternalTriggersApi.deleteExternalTrigger;

  // Enhanced Operations
  public getEnhanced = EnhancedOperationsApi.getEnhanced;
  public createEnhanced = EnhancedOperationsApi.createEnhanced;
  public updateEnhanced = EnhancedOperationsApi.updateEnhanced;
  public queryEnhanced = EnhancedOperationsApi.queryEnhanced;
  public executeEnhanced = EnhancedOperationsApi.executeEnhanced;
  public pauseWorkflow = EnhancedOperationsApi.pauseWorkflow;
  public resumeWorkflow = EnhancedOperationsApi.resumeWorkflow;
  public cancelWorkflow = EnhancedOperationsApi.cancelWorkflow;
  public cloneWorkflow = EnhancedOperationsApi.cloneWorkflow;
  public exportWorkflow = EnhancedOperationsApi.exportWorkflow;
  public importWorkflow = EnhancedOperationsApi.importWorkflow;
}

// Export singleton instance
export const workflowAdvancedApi = new WorkflowAdvancedApiService();
