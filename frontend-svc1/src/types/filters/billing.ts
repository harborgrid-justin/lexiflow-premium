/**
 * Billing Domain Filter Types
 * Centralized filter interfaces for billing API services
 */

// Time Entry Filters
export interface TimeEntryFilters {
  caseId?: string;
  userId?: string;
  clientId?: string;
  billable?: boolean;
  status?: 'draft' | 'submitted' | 'approved' | 'invoiced' | 'rejected';
  startDate?: string;
  endDate?: string;
}

// Invoice Filters
export interface InvoiceFilters {
  clientId?: string;
  caseId?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

// Expense Filters
export interface ExpenseFilters {
  caseId?: string;
  userId?: string;
  clientId?: string;
  category?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'reimbursed' | 'rejected';
  startDate?: string;
  endDate?: string;
}
