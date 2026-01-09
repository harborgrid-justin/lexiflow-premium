/**
 * Write-Off Module Types
 *
 * Shared TypeScript definitions for write-off management.
 * Extracted from write-off-actions.ts to support Next.js 16 server action boundaries.
 *
 * @module billing/write-off-types
 */

export type WriteOffStatus = "pending" | "approved" | "rejected";

export interface WriteOffRequest {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  amount: number;
  reason: string;
  category?: WriteOffCategory;
  requestedBy: string;
  requestedByName?: string;
  requestedDate: string;
  status: WriteOffStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  notes?: string;
  impactedArAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type WriteOffCategory =
  | "uncollectible"
  | "client_dispute"
  | "billing_error"
  | "courtesy_adjustment"
  | "bankruptcy"
  | "settlement"
  | "other";

export const WRITE_OFF_CATEGORIES: {
  value: WriteOffCategory;
  label: string;
}[] = [
  { value: "uncollectible", label: "Uncollectible Debt" },
  { value: "client_dispute", label: "Client Dispute" },
  { value: "billing_error", label: "Billing Error" },
  { value: "courtesy_adjustment", label: "Courtesy Adjustment" },
  { value: "bankruptcy", label: "Client Bankruptcy" },
  { value: "settlement", label: "Settlement Agreement" },
  { value: "other", label: "Other" },
];

export interface CreateWriteOffInput {
  invoiceId: string;
  amount: number;
  reason: string;
  category?: WriteOffCategory;
  notes?: string;
}

export interface WriteOffFilters {
  status?: WriteOffStatus | string;
  invoiceId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  requestedBy?: string;
  category?: WriteOffCategory | string;
}

export interface WriteOffStats {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
  totalRejectedAmount: number;
  averageApprovalTime?: number; // in hours
}
