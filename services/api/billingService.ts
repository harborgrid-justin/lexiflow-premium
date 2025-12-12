/**
 * Billing Service
 * Handles time entries, invoices, expenses, and financial operations
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type {
  TimeEntryListResponse,
  TimeEntryItem,
  CreateTimeEntryRequest,
  InvoiceListResponse,
  InvoiceItem,
  InvoiceDetailsResponse,
  PaginationParams,
} from '../../types/api';

export interface TimeEntryFilters extends PaginationParams {
  caseId?: string;
  userId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'INVOICED';
  dateFrom?: string;
  dateTo?: string;
  isBillable?: boolean;
}

export interface InvoiceFilters extends PaginationParams {
  caseId?: string;
  clientId?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpenseFilters extends PaginationParams {
  caseId?: string;
  category?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REIMBURSED';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * TIME ENTRIES
 */

/**
 * Get list of time entries
 */
export async function getTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntryListResponse> {
  try {
    const response = await apiClient.get<TimeEntryListResponse>(
      API_ENDPOINTS.BILLING.TIME_ENTRIES,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get time entry by ID
 */
export async function getTimeEntryById(id: string): Promise<TimeEntryItem> {
  try {
    const response = await apiClient.get<TimeEntryItem>(
      API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create time entry
 */
export async function createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntryItem> {
  try {
    const response = await apiClient.post<TimeEntryItem>(
      API_ENDPOINTS.BILLING.TIME_ENTRIES,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update time entry
 */
export async function updateTimeEntry(
  id: string,
  data: Partial<CreateTimeEntryRequest>
): Promise<TimeEntryItem> {
  try {
    const response = await apiClient.put<TimeEntryItem>(
      API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Submit time entries for approval
 */
export async function submitTimeEntries(ids: string[]): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.BILLING.TIME_ENTRIES}/submit`, { ids });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Approve time entries
 */
export async function approveTimeEntries(ids: string[]): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.BILLING.TIME_ENTRIES}/approve`, { ids });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * INVOICES
 */

/**
 * Get list of invoices
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<InvoiceListResponse> {
  try {
    const response = await apiClient.get<InvoiceListResponse>(
      API_ENDPOINTS.BILLING.INVOICES,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string): Promise<InvoiceDetailsResponse> {
  try {
    const response = await apiClient.get<InvoiceDetailsResponse>(
      API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate invoice for case
 */
export async function generateInvoice(data: {
  caseId: string;
  timeEntryIds?: string[];
  expenseIds?: string[];
  dueDate: string;
  notes?: string;
}): Promise<InvoiceItem> {
  try {
    const response = await apiClient.post<InvoiceItem>(
      API_ENDPOINTS.BILLING.GENERATE_INVOICE,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update invoice
 */
export async function updateInvoice(
  id: string,
  updates: Partial<InvoiceItem>
): Promise<InvoiceItem> {
  try {
    const response = await apiClient.put<InvoiceItem>(
      API_ENDPOINTS.BILLING.INVOICE_BY_ID(id),
      updates
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Send invoice to client
 */
export async function sendInvoice(id: string, email?: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/send`, { email });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(id: string, paymentData: {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
}): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/payment`, paymentData);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(id: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * EXPENSES
 */

/**
 * Get list of expenses
 */
export async function getExpenses(filters?: ExpenseFilters): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BILLING.EXPENSES, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create expense
 */
export async function createExpense(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.BILLING.EXPENSES, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update expense
 */
export async function updateExpense(id: string, data: any): Promise<any> {
  try {
    const response = await apiClient.put(
      API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete expense
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * RATES
 */

/**
 * Get billing rates
 */
export async function getRates(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BILLING.RATES);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * TRUST ACCOUNTS
 */

/**
 * Get trust accounts
 */
export async function getTrustAccounts(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BILLING.TRUST_ACCOUNTS);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * REPORTS
 */

/**
 * Get billing reports
 */
export async function getBillingReports(params: {
  reportType: 'summary' | 'detailed' | 'aging' | 'wip';
  dateFrom?: string;
  dateTo?: string;
  caseId?: string;
  clientId?: string;
}): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BILLING.REPORTS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get work-in-progress (WIP) data
 */
export async function getWIP(filters?: { caseId?: string; userId?: string }): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BILLING.WIP, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  // Time Entries
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  submitTimeEntries,
  approveTimeEntries,
  // Invoices
  getInvoices,
  getInvoiceById,
  generateInvoice,
  updateInvoice,
  sendInvoice,
  markInvoicePaid,
  downloadInvoice,
  // Expenses
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  // Other
  getRates,
  getTrustAccounts,
  getBillingReports,
  getWIP,
};
