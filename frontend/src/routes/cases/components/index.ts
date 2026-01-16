/**
 * Cases Components Barrel Export
 *
 * ARCHITECTURE NOTES:
 * - Only exports presentation components
 * - No state, hooks, or services
 * - Components receive data via props
 * - Components emit events via callbacks
 *
 * @module routes/cases/components
 */

// ============================================================================
// ERROR & LOADING STATES
// ============================================================================

export { CaseListError } from "./CaseListError";
export { CaseListSkeleton } from "./CaseListSkeleton";

// ============================================================================
// FEATURE MODULES
// ============================================================================

// Note: Subdirectories (analytics, calendar, create, detail, docket,
// enterprise, financials, import, insights, intake, list, operations,
// overview, planning, workflow) should export their own index.ts
// and be imported as needed to maintain code-splitting benefits
