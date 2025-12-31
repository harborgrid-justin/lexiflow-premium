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
export * from './components/list';
export * from './components/detail';
export * from './components/create';
export * from './components/docket';
export * from './components/entities';
export * from './components/workflow';
export * from './components/calendar';

// Stub components (temporary)
import React from 'react';
export const PlanningSidebar: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Planning Sidebar (stub)</div>;
export const ScheduleTimeline: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Schedule Timeline (stub)</div>;
export const BuilderToolbar: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Builder Toolbar (stub)</div>;
export const BuilderCanvas: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Builder Canvas (stub)</div>;
