/**
 * Billing Components Barrel Export
 *
 * ARCHITECTURE NOTES:
 * - Only exports presentation components
 * - No state, hooks, or services
 * - Components receive data via props
 * - Components emit events via callbacks
 *
 * @module routes/billing/components
 */

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export { default as BillingDashboard } from "./BillingDashboard";
export { BillingDashboardContent } from "./BillingDashboardContent";
export { BillingErrorBoundary } from "./BillingErrorBoundary";
export { BillingSkeleton } from "./BillingSkeleton";

// ============================================================================
// VIEW COMPONENTS
// ============================================================================

export { BillingLedger } from "./BillingLedger";
export { BillingOverview } from "./BillingOverview";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export { LedgerTabs } from "./LedgerTabs";
export { TransactionForm } from "./TransactionForm";

// ============================================================================
// CODE-SPLIT COMPONENTS
// ============================================================================

// Note: BillingInvoices and BillingWIP are dynamically imported
// Do not export statically to maintain code-splitting benefits
