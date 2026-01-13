/**
 * Workflow Module - Enterprise-Level Organization
 * 
 * Structure:
 * - Core: Types, utilities, constants
 * - Designers: Visual workflow builders (Advanced, Template)
 * - Management: Master workflow, library, engine
 * - Execution: Task management, dependencies, parallel execution
 * - Monitoring: SLA, analytics, audit trails, notifications
 * - Automation: Config, automations, approvals
 * - Process: Firm processes, case workflows
 * - Builder: Modular builder components (canvas, palette, properties)
 * - Components: Feature-specific panels and sub-components
 * - Hooks: Custom hooks for workflow logic
 */

// ============================================================================
// CORE - Types, Utils, Constants
// ============================================================================
export * from './types';
export * from './utils';
export * from './constants';

// ============================================================================
// DESIGNERS - Visual Workflow Builders
// ============================================================================
export * from './AdvancedWorkflowDesigner';
export * from './WorkflowTemplateBuilder';

// ============================================================================
// MANAGEMENT - Workflow Library & Engine
// ============================================================================
export * from './MasterWorkflow';
export * from './WorkflowLibrary';
export * from './WorkflowEngineDetail';
export * from './TemplatePreview';
export * from './TemplateActions';

// ============================================================================
// EXECUTION - Task Management
// ============================================================================
export * from './ParallelTasksManager';
export * from './TaskDependencyManager';
export * from './TaskReassignmentPanel';
export * from './TaskWorkflowBadges';
export * from './StageEditor';

// ============================================================================
// MONITORING - Analytics & Tracking
// ============================================================================
export * from './SLAMonitor';
export * from './WorkflowAnalyticsDashboard';
export * from './AuditTrailViewer';
export * from './NotificationCenter';
export * from './TimeTrackingPanel';
export * from './WorkflowTimeline';

// ============================================================================
// AUTOMATION - Configuration & Approvals
// ============================================================================
export * from './WorkflowConfig';
export * from './WorkflowAutomations';
export * from './ApprovalWorkflow';
export * from './WorkflowQuickActions';

// ============================================================================
// PROCESS - Firm & Case Workflows
// ============================================================================
export * from './FirmProcessList';
export * from './FirmProcessDetail';
export * from './CaseWorkflowList';

// ============================================================================
// PANELS - Enhanced Workflow Panel (Main UI)
// ============================================================================
export * from './EnhancedWorkflowPanel';

// ============================================================================
// SUB-MODULES - Nested Exports
// ============================================================================
export * from './builder';
export * from './components';
export * from './modules';
export * from './hooks';
