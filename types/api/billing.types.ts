/**
 * Billing-related API Types
 */

import type { PaginatedResponse, AuditFields, UserReference, CaseReference, ID } from './common';

// Time entry status
export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced';

// Invoice status
export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled'
  | 'void';

// Expense status
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced' | 'reimbursed';

// Payment method
export type PaymentMethod =
  | 'cash'
  | 'check'
  | 'credit_card'
  | 'debit_card'
  | 'wire_transfer'
  | 'ach'
  | 'paypal'
  | 'other';

// Time entry
export interface TimeEntry extends AuditFields {
  id: ID;
  caseId: ID;
  case?: CaseReference;
  userId: ID;
  user?: UserReference;
  activityType: string;
  description: string;
  date: Date;
  hours: number;
  minutes: number;
  totalMinutes: number;
  rate: number;
  amount: number;
  isBillable: boolean;
  status: TimeEntryStatus;
  invoiceId?: ID;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
  approvedBy?: ID;
  approvedAt?: Date;
  rejectionReason?: string;
}

// Create time entry request
export interface CreateTimeEntryRequest {
  caseId: ID;
  activityType: string;
  description: string;
  date: Date;
  hours: number;
  minutes: number;
  rate?: number;
  isBillable?: boolean;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
}

// Update time entry request
export interface UpdateTimeEntryRequest {
  activityType?: string;
  description?: string;
  date?: Date;
  hours?: number;
  minutes?: number;
  rate?: number;
  isBillable?: boolean;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
}

// Time entry list response
export interface TimeEntryListResponse extends PaginatedResponse<TimeEntry> {
  totalHours: number;
  totalAmount: number;
}

// Invoice
export interface Invoice extends AuditFields {
  id: ID;
  invoiceNumber: string;
  caseId: ID;
  case?: CaseReference;
  clientId: ID;
  clientName?: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  timeEntries?: number;
  expenses?: number;
  notes?: string;
  paymentTerms?: string;
  lateFee?: number;
  sentDate?: Date;
  remindersSent?: number;
  lastReminderDate?: Date;
}

// Invoice line item
export interface InvoiceLineItem {
  id: ID;
  invoiceId: ID;
  type: 'time' | 'expense' | 'flat_fee' | 'adjustment';
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  date?: Date;
  referenceId?: ID;
}

// Create invoice request
export interface CreateInvoiceRequest {
  caseId: ID;
  clientId: ID;
  issueDate: Date;
  dueDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  timeEntryIds?: ID[];
  expenseIds?: ID[];
  notes?: string;
  paymentTerms?: string;
  discount?: number;
  tax?: number;
}

// Update invoice request
export interface UpdateInvoiceRequest {
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  paymentTerms?: string;
  discount?: number;
  tax?: number;
  status?: InvoiceStatus;
}

// Invoice list response
export interface InvoiceListResponse extends PaginatedResponse<Invoice> {
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

// Payment record
export interface PaymentRecord extends AuditFields {
  id: ID;
  invoiceId: ID;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

// Expense
export interface Expense extends AuditFields {
  id: ID;
  caseId: ID;
  case?: CaseReference;
  userId: ID;
  user?: UserReference;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isBillable: boolean;
  isReimbursable: boolean;
  status: ExpenseStatus;
  invoiceId?: ID;
  receiptUrl?: string;
  receiptUploaded: boolean;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  approvedBy?: ID;
  approvedAt?: Date;
  rejectionReason?: string;
  reimbursedDate?: Date;
}

// Create expense request
export interface CreateExpenseRequest {
  caseId: ID;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isBillable?: boolean;
  isReimbursable?: boolean;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// Update expense request
export interface UpdateExpenseRequest {
  category?: string;
  description?: string;
  amount?: number;
  date?: Date;
  isBillable?: boolean;
  isReimbursable?: boolean;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// Expense list response
export interface ExpenseListResponse extends PaginatedResponse<Expense> {
  totalAmount: number;
  billableAmount: number;
  reimbursableAmount: number;
}

// Billing statistics
export interface BillingStatistics {
  timeEntries: {
    total: number;
    totalHours: number;
    totalAmount: number;
    billableHours: number;
    billableAmount: number;
  };
  invoices: {
    total: number;
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
    overdueCount: number;
    overdueAmount: number;
  };
  expenses: {
    total: number;
    totalAmount: number;
    billableAmount: number;
    reimbursableAmount: number;
  };
  realization: number;
  collectionRate: number;
}

// Work in progress
export interface WorkInProgress {
  caseId: ID;
  caseName: string;
  unbilledTimeEntries: number;
  unbilledTimeAmount: number;
  unbilledExpenses: number;
  unbilledExpenseAmount: number;
  totalUnbilled: number;
  oldestEntryDate?: Date;
}
