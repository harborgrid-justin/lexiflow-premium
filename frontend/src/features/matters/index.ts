/**
 * Matter Management Module - Barrel Export
 * 
 * Comprehensive matter management components for LexiFlow
 * Enterprise-grade matter lifecycle management
 */

// Overview Dashboard
export { MatterOverviewDashboard } from './overview/MatterOverviewDashboard';

// Analytics & Reports
export { MatterAnalyticsDashboard } from './analytics/MatterAnalyticsDashboard';

// Intake & Onboarding
export { NewMatterIntakeForm } from './intake/NewMatterIntakeForm';

// Operations & Task Management
export { MatterOperationsCenter } from './operations/MatterOperationsCenter';

// Strategic Insights
export { MatterInsightsDashboard } from './insights/MatterInsightsDashboard';

// Financial Management
export { MatterFinancialsCenter } from './financials/MatterFinancialsCenter';

// Re-export existing components for backward compatibility
export * from './list';
export * from './detail';
export * from './create';
export * from './docket';
export * from './entities';
export * from './workflow';
export * from './calendar';
