/**
 * Barrel export for case creation components
 * 
 * Exports:
 * - NewCase: Unified case creation with intake, court info, parties, financials, related cases (PRIMARY - DEFAULT EXPORT)
 * - CaseDataImport: Import cases from external systems
 */

export { default } from './NewCase';
export { default as NewCase } from './NewCase';
export { CaseDataImport } from './CaseDataImport';
