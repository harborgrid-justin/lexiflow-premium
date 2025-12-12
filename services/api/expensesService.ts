/**
 * Expenses Service
 * Handles case expenses, reimbursements, and expense tracking
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Expense {
  id: string;
  caseId: string;
  caseName?: string;
  userId: string;
  userName?: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isBillable: boolean;
  isReimbursable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced' | 'reimbursed';
  invoiceId?: string;
  receiptUrl?: string;
  receiptUploaded: boolean;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  reimbursedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseRequest {
  caseId: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  isBillable?: boolean;
  isReimbursable?: boolean;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  category?: string;
  description?: string;
  amount?: number;
  date?: Date;
  isBillable?: boolean;
  isReimbursable?: boolean;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface ExpensesListResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalAmount: number;
  billableAmount: number;
  reimbursableAmount: number;
}

export interface ExpenseStatistics {
  total: number;
  totalAmount: number;
  billableAmount: number;
  reimbursableAmount: number;
  byStatus: Record<Expense['status'], { count: number; amount: number }>;
  byCategory: Array<{ category: string; count: number; amount: number }>;
  byUser: Array<{ userId: string; userName: string; count: number; amount: number }>;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  defaultBillable: boolean;
  defaultReimbursable: boolean;
}

/**
 * Get expenses with filters
 */
export async function getExpenses(params?: PaginationParams & {
  caseId?: string;
  userId?: string;
  category?: string;
  status?: Expense['status'];
  isBillable?: boolean;
  isReimbursable?: boolean;
  dateFrom?: string;
  dateTo?: string;
  invoiceId?: string;
  search?: string;
}): Promise<ExpensesListResponse> {
  try {
    const response = await apiClient.get<ExpensesListResponse>(
      API_ENDPOINTS.BILLING.EXPENSES,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get expense by ID
 */
export async function getExpenseById(id: string): Promise<Expense> {
  try {
    const response = await apiClient.get<Expense>(
      API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new expense
 */
export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  try {
    const response = await apiClient.post<Expense>(
      API_ENDPOINTS.BILLING.EXPENSES,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update expense
 */
export async function updateExpense(
  id: string,
  data: UpdateExpenseRequest
): Promise<Expense> {
  try {
    const response = await apiClient.put<Expense>(
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
 * Upload expense receipt
 */
export async function uploadReceipt(id: string, file: File): Promise<Expense> {
  try {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await apiClient.post<Expense>(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download expense receipt
 */
export async function downloadReceipt(id: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/receipt`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Submit expense for approval
 */
export async function submitExpense(id: string): Promise<Expense> {
  try {
    const response = await apiClient.post<Expense>(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/submit`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Approve expense
 */
export async function approveExpense(id: string): Promise<Expense> {
  try {
    const response = await apiClient.post<Expense>(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/approve`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Reject expense
 */
export async function rejectExpense(id: string, reason: string): Promise<Expense> {
  try {
    const response = await apiClient.post<Expense>(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/reject`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark expense as reimbursed
 */
export async function markAsReimbursed(
  id: string,
  reimbursedDate?: Date
): Promise<Expense> {
  try {
    const response = await apiClient.post<Expense>(
      `${API_ENDPOINTS.BILLING.EXPENSE_BY_ID(id)}/reimburse`,
      {
        reimbursedDate: reimbursedDate || new Date(),
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Bulk create expenses
 */
export async function bulkCreateExpenses(
  expenses: CreateExpenseRequest[]
): Promise<Expense[]> {
  try {
    const response = await apiClient.post<Expense[]>(
      `${API_ENDPOINTS.BILLING.EXPENSES}/bulk`,
      { expenses }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Bulk approve expenses
 */
export async function bulkApproveExpenses(ids: string[]): Promise<{ approved: number }> {
  try {
    const response = await apiClient.post<{ approved: number }>(
      `${API_ENDPOINTS.BILLING.EXPENSES}/bulk-approve`,
      { ids }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get expense statistics
 */
export async function getExpenseStatistics(params?: {
  caseId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ExpenseStatistics> {
  try {
    const response = await apiClient.get<ExpenseStatistics>(
      `${API_ENDPOINTS.BILLING.EXPENSES}/statistics`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get expense categories
 */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const response = await apiClient.get<ExpenseCategory[]>(
      `${API_ENDPOINTS.BILLING.EXPENSES}/categories`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create expense category
 */
export async function createExpenseCategory(data: {
  name: string;
  description?: string;
  defaultBillable?: boolean;
  defaultReimbursable?: boolean;
}): Promise<ExpenseCategory> {
  try {
    const response = await apiClient.post<ExpenseCategory>(
      `${API_ENDPOINTS.BILLING.EXPENSES}/categories`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Export expenses
 */
export async function exportExpenses(
  params: {
    caseId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  format: 'csv' | 'excel' | 'pdf' = 'excel'
): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.EXPENSES}/export`,
      {
        params: { ...params, format },
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  downloadReceipt,
  submitExpense,
  approveExpense,
  rejectExpense,
  markAsReimbursed,
  bulkCreateExpenses,
  bulkApproveExpenses,
  getExpenseStatistics,
  getExpenseCategories,
  createExpenseCategory,
  exportExpenses,
};
