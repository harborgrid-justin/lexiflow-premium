/**
 * Enterprise Billing Features
 * Advanced billing functionality including pre-bill review, write-offs, aging, etc.
 */

import type { Invoice, TimeEntry } from "@/types/financial";

/**
 * LEDES (Legal Electronic Data Exchange Standard) codes
 * UTBMS (Uniform Task-Based Management System)
 */
export const LEDES_TASK_CODES = {
  // Legal Analysis & Research (L100-L199)
  L100: "Case Assessment, Development and Administration",
  L110: "Factual Investigation",
  L120: "Analysis/Strategy",
  L130: "Experts/Consultants",
  L140: "Written Discovery",
  L150: "Depositions",
  L160: "Motions",
  L200: "Legal Research",
  L210: "Case Law Research",
  L220: "Statutory Research",

  // Document Management (L300-L399)
  L300: "Document/File Management",
  L310: "Document Production/Copying",
  L320: "Document Review",

  // Court/Administrative Proceedings (L400-L499)
  L400: "Court Appearances",
  L410: "Trials",
  L420: "Hearings",
  L430: "Arbitration",
  L440: "Mediation",

  // Depositions (L500-L599)
  L500: "Depositions and Testimony",
  L510: "Deposition Preparation",
  L520: "Deposition Taking",
  L530: "Deposition Attendance",

  // Expert/Consultant (L600-L699)
  L600: "Experts",
  L610: "Expert Research",
  L620: "Expert Reports",

  // Administrative (A100-A199)
  A100: "Administrative",
  A101: "Attorney Time",
  A102: "Paralegal Time",
  A103: "Clerk Time",
} as const;

/**
 * LEDES Activity codes
 */
export const LEDES_ACTIVITY_CODES = {
  P100: "Pre-litigation Analysis",
  P101: "Client Consultation",
  P102: "Fact Investigation",
  P103: "Legal Research",

  L100: "Pleadings",
  L101: "Complaint Drafting",
  L102: "Answer Drafting",
  L103: "Motion Practice",

  D100: "Discovery",
  D101: "Interrogatories",
  D102: "Document Requests",
  D103: "Depositions",

  T100: "Trial Preparation",
  T101: "Witness Preparation",
  T102: "Exhibit Preparation",
  T103: "Trial",

  N100: "Negotiation/Settlement",
  N101: "Settlement Discussion",
  N102: "Mediation",
  N103: "Arbitration",
} as const;

/**
 * Pre-bill review status
 */
export type PreBillStatus =
  | "Pending Review"
  | "Approved"
  | "Revised"
  | "Rejected";

/**
 * Pre-bill review item
 */
export interface PreBillReviewItem {
  id: string;
  entryId: string;
  entryType: "time" | "expense";
  description: string;
  originalAmount: number;
  adjustedAmount?: number;
  writeOffAmount?: number;
  writeOffReason?: string;
  status: PreBillStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

/**
 * Write-off reasons
 */
export const WRITE_OFF_REASONS = [
  "Client courtesy discount",
  "Excessive time",
  "Duplicate work",
  "Administrative task",
  "Training/learning time",
  "Inefficiency",
  "Billing judgment",
  "Client budget constraint",
  "Collection risk",
  "Other",
] as const;

/**
 * Calculate write-off amount and percentage
 */
export function calculateWriteOff(
  originalAmount: number,
  adjustedAmount: number
): { amount: number; percentage: number } {
  const amount = originalAmount - adjustedAmount;
  const percentage = (amount / originalAmount) * 100;

  return {
    amount: Math.max(0, amount),
    percentage: Math.max(0, Math.min(100, percentage)),
  };
}

/**
 * Apply write-off to time entry
 */
export function applyWriteOff(
  entry: TimeEntry,
  writeOffPercentage: number,
  reason: string
): TimeEntry {
  // reason parameter reserved for audit trail (future implementation)
  void reason;
  const writeOffAmount = (entry.total * writeOffPercentage) / 100;
  const adjustedTotal = entry.total - writeOffAmount;

  return {
    ...entry,
    discount: writeOffPercentage,
    discountedTotal: adjustedTotal,
  } as TimeEntry;
}

/**
 * Aging bucket for invoices
 */
export type AgingBucket =
  | "Current"
  | "1-30 Days"
  | "31-60 Days"
  | "61-90 Days"
  | "90+ Days";

/**
 * Calculate invoice age in days
 */
export function calculateInvoiceAge(invoice: Invoice): number {
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get aging bucket for invoice
 */
export function getAgingBucket(invoice: Invoice): AgingBucket {
  if (invoice.status === "Paid") {
    return "Current";
  }

  const age = calculateInvoiceAge(invoice);

  if (age <= 0) return "Current";
  if (age <= 30) return "1-30 Days";
  if (age <= 60) return "31-60 Days";
  if (age <= 90) return "61-90 Days";
  return "90+ Days";
}

/**
 * Aging report data
 */
export interface AgingReport {
  buckets: {
    [key in AgingBucket]: {
      count: number;
      amount: number;
      invoices: Invoice[];
    };
  };
  totalOutstanding: number;
  totalInvoices: number;
}

/**
 * Generate aging report
 */
export function generateAgingReport(invoices: Invoice[]): AgingReport {
  const buckets: AgingReport["buckets"] = {
    Current: { count: 0, amount: 0, invoices: [] },
    "1-30 Days": { count: 0, amount: 0, invoices: [] },
    "31-60 Days": { count: 0, amount: 0, invoices: [] },
    "61-90 Days": { count: 0, amount: 0, invoices: [] },
    "90+ Days": { count: 0, amount: 0, invoices: [] },
  };

  let totalOutstanding = 0;

  const unpaidInvoices = invoices.filter((inv) => inv.balanceDue > 0);

  unpaidInvoices.forEach((invoice) => {
    const bucket = getAgingBucket(invoice);
    buckets[bucket].count++;
    buckets[bucket].amount += invoice.balanceDue;
    buckets[bucket].invoices.push(invoice);
    totalOutstanding += invoice.balanceDue;
  });

  return {
    buckets,
    totalOutstanding,
    totalInvoices: unpaidInvoices.length,
  };
}

/**
 * Batch invoice generation settings
 */
export interface BatchInvoiceSettings {
  caseIds?: string[];
  clientIds?: string[];
  dateRange: {
    start: string;
    end: string;
  };
  groupBy: "case" | "client";
  includeUnbilledTime: boolean;
  includeUnbilledExpenses: boolean;
  applyRetainer: boolean;
}

/**
 * Calculate realization rate
 * (Amount billed / Amount worked) * 100
 */
export function calculateRealizationRate(
  workedAmount: number,
  billedAmount: number
): number {
  if (workedAmount === 0) return 0;
  return (billedAmount / workedAmount) * 100;
}

/**
 * Calculate collection rate
 * (Amount collected / Amount billed) * 100
 */
export function calculateCollectionRate(
  billedAmount: number,
  collectedAmount: number
): number {
  if (billedAmount === 0) return 0;
  return (collectedAmount / billedAmount) * 100;
}

/**
 * Trust account compliance check
 * Ensures no negative balances and proper segregation
 */
export interface TrustComplianceCheck {
  isCompliant: boolean;
  issues: string[];
}

/**
 * Perform 3-way trust reconciliation
 * Bank statement balance = Main ledger = Sum of client sub-ledgers
 */
export function performThreeWayReconciliation(
  bankBalance: number,
  mainLedgerBalance: number,
  clientSubLedgersTotal: number
): TrustComplianceCheck {
  const issues: string[] = [];

  if (Math.abs(bankBalance - mainLedgerBalance) > 0.01) {
    issues.push(
      `Bank balance ($${bankBalance}) does not match main ledger ($${mainLedgerBalance})`
    );
  }

  if (Math.abs(mainLedgerBalance - clientSubLedgersTotal) > 0.01) {
    issues.push(
      `Main ledger ($${mainLedgerBalance}) does not match client sub-ledgers total ($${clientSubLedgersTotal})`
    );
  }

  if (bankBalance < 0 || mainLedgerBalance < 0) {
    issues.push("Trust account has negative balance - CRITICAL VIOLATION");
  }

  return {
    isCompliant: issues.length === 0,
    issues,
  };
}

/**
 * Payment terms calculator
 */
export function calculateDueDate(
  invoiceDate: string,
  paymentTerms: "Net 15" | "Net 30" | "Net 45" | "Net 60" | "Due on Receipt"
): string {
  const date = new Date(invoiceDate);

  switch (paymentTerms) {
    case "Net 15":
      date.setDate(date.getDate() + 15);
      break;
    case "Net 30":
      date.setDate(date.getDate() + 30);
      break;
    case "Net 45":
      date.setDate(date.getDate() + 45);
      break;
    case "Net 60":
      date.setDate(date.getDate() + 60);
      break;
    case "Due on Receipt":
      // Same as invoice date
      break;
  }

  return date.toISOString().split("T")[0];
}
