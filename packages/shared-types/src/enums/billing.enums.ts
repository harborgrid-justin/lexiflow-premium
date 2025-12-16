/**
 * Billing-related enums
 * Shared between frontend and backend
 */

export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  SENT = 'Sent',
  PARTIAL = 'Partial',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  WRITTEN_OFF = 'Written Off',
  CANCELLED = 'Cancelled',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export enum WIPStatus {
  UNBILLED = 'Unbilled',
  READY_TO_BILL = 'Ready to Bill',
  BILLED = 'Billed',
  WRITTEN_OFF = 'Written Off',
}

export enum ExpenseStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  BILLED = 'Billed',
  REIMBURSED = 'Reimbursed',
}

export enum TrustAccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  CLOSED = 'Closed',
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
}

/**
 * LEDES (Legal Electronic Data Exchange Standard) codes
 */
export type LedesActivityCode = string; // e.g., 'A100'
export type LedesTaskCode = string; // e.g., 'L110'
