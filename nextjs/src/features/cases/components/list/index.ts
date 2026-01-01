export * from "./CaseListActive";
export * from "./CaseListArchived";
export * from "./CaseListClosing";
export * from "./CaseListConflicts";
export * from "./CaseListDocket";
export * from "./CaseListExperts";
export * from "./CaseListIntake";
export * from "./CaseListReporters";
export * from "./CaseListResources";
export * from "./CaseListTasks";
export * from "./CaseListToolbar";
export * from "./CaseListTrust";

// ============================================================================
// Case Management (Unified under case terminology)
// ============================================================================
export { CaseDetail } from "./CaseDetail"; // Case detail view
export { CaseManagement } from "./CaseManagement"; // Main case management component
export { default as CaseManagementHub } from "./CaseManagementHub"; // Enterprise hub for case management
export { CaseModule } from "./CaseModule"; // Primary case module router
// CaseListView is dynamically imported - don't export statically to avoid chunk splitting issues
