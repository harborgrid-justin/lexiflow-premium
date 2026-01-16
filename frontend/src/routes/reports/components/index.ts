/**
 * Reports Components Barrel Export
 *
 * ARCHITECTURE NOTES:
 * - Only exports presentation components
 * - No state, hooks, or services
 * - Components receive data via props
 * - Components emit events via callbacks
 *
 * @module routes/reports/components
 */

// ============================================================================
// VIEW COMPONENTS
// ============================================================================

export { ReportCard } from "./ReportCard";
export { ReportFilters } from "./ReportFilters";
export { ReportGrid } from "./ReportGrid";
export { ReportsCenter } from "./ReportsCenter";
export { ReportStats } from "./ReportStats";

// ============================================================================
// TYPES
// ============================================================================

export type { Report } from "./types";
