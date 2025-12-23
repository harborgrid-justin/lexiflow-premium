/**
 * Barrel export for matter creation components
 * 
 * Exports:
 * - NewMatter: Unified matter creation with intake, court info, parties, financials, related cases (PRIMARY - DEFAULT EXPORT)
 * - CaseManagementHub: Enterprise hub for case management
 * - CaseDataImport: Import cases from external systems
 */

export { default } from './NewMatter';
export { default as NewMatter } from './NewMatter';
export { default as CaseManagementHub } from './CaseManagementHub';
export { CaseDataImport } from './CaseDataImport';
