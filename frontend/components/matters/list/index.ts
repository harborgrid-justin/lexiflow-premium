
export * from './CaseListActive';
export * from './CaseListIntake';
export * from './CaseListDocket';
export * from './CaseListResources';
export * from './CaseListTrust';
export * from './CaseListExperts';
export * from './CaseListConflicts';
export * from './CaseListTasks';
export * from './CaseListReporters';
export * from './CaseListClosing';
export * from './CaseListArchived';
export * from './CaseListToolbar';

// ============================================================================
// Matter Management (Consolidated: matters === cases)
// ============================================================================
// These components were previously in /matters and /matter-management
// They are now co-located with cases since matters and cases represent
// the same entity in legal practice.
export { MatterModule } from './MatterModule';
export { MatterManagement } from './MatterManagement';
export { MatterDetail } from './MatterDetail';
export { MatterForm } from './matter-form/MatterForm';
export { NewMatter } from './NewMatter';
