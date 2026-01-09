/**
 * Case Management Module - Barrel Export
 *
 * Comprehensive case management components for LexiFlow
 * Enterprise-grade case lifecycle management
 */

// Overview Dashboard
export { CaseOverviewDashboard } from './components/overview/CaseOverviewDashboard';

// Analytics & Reports
export { CaseAnalyticsDashboard } from './components/analytics/CaseAnalyticsDashboard';

// Intake & Onboarding
export { NewCaseIntakeForm } from './components/intake/NewCaseIntakeForm';

// Operations & Task Management
export { CaseOperationsCenter } from './components/operations/CaseOperationsCenter';

// Strategic Insights
export { CaseInsightsDashboard } from './components/insights/CaseInsightsDashboard';

// Financial Management
export { CaseFinancialsCenter } from './components/financials/CaseFinancialsCenter';

// Primary Case Management Component
export { CaseManagement } from './components/list';

// Re-export existing components
export * from './components/calendar';
export * from './components/create';
export * from './components/detail';
export * from './components/docket';
export * from './components/entities';
export * from './components/list';
export * from './components/workflow';

// Planning & Builder Components
export { BuilderCanvas } from './components/planning/BuilderCanvas';
export { BuilderToolbar } from './components/planning/BuilderToolbar';
export { PlanningSidebar } from './components/planning/PlanningSidebar';
export { ScheduleTimeline } from './components/planning/ScheduleTimeline';
