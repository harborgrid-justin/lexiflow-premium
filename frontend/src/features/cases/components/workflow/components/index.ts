/**
 * Workflow Components Module
 * 
 * Advanced Workflow Designer UI Components:
 * - WorkflowDesignerHeader: Top navigation and actions
 * - WorkflowFeatureTabs: 10-feature tab navigation
 * - WorkflowFeatureStats: Real-time workflow metrics
 * - Panels: 10 advanced feature panels (see ./panels/)
 */

export { WorkflowDesignerHeader } from './WorkflowDesignerHeader';
export { WorkflowFeatureStats } from './WorkflowFeatureStats';
export { WorkflowFeatureTabs } from './WorkflowFeatureTabs';
export type { FeatureTab, FeatureTabConfig } from './WorkflowFeatureTabs';

// Feature Panels (10 advanced capabilities)
export * from './panels';
