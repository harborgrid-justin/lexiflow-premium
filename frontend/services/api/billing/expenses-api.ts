/**
 * Consolidated Expenses API Service
 * Merges duplicate implementations from apiServicesAdditional.ts
 * 100% backend endpoint coverage (10/10 endpoints)
 */

import { apiClient, type PaginatedResponse } from '../../apiClient';
import type { FirmExpense } from '../../../types';

export interface ExpenseFilters {
  caseId?: string;
  userId?: string;
  category?: string;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Billed' | 'Rejected';
  startDate?: string;
  endDate?: string;
  billable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateExpenseDto {
  caseId: string;
  userId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  billable?: boolean;
  receipt?: {
    filename: string;
    url: string;
    size: number;
  };
  vendor?: string;
  paymentMethod?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpenseTotals {
  total: number;
  billable: number;
  unbilled: number;
  amount: number;
}

export class ExpensesApiService {
  /**
   * Get all expenses with optional filters
   * GET /api/v1/billing/expenses
   */
  async getAll(filters?: ExpenseFilters): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>('/billing/expenses', filters);
    return response.data;
  }

  /**
   * Get expenses by case ID
   * GET /api/v1/billing/expenses?caseId=:caseId
   */
  async getByCaseId(caseId: string): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>('/billing/expenses', { caseId });
    return response.data;
  }

  /**
   * Get unbilled expenses for a case
   * GET /api/v1/billing/expenses/unbilled/:caseId
   */
  async getUnbilled(caseId: string): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>(`/billing/expenses/unbilled/${caseId}`);
    return response.data;
  }

  /**
   * Get expense by ID
   * GET /api/v1/billing/expenses/:id
   */
  async getById(id: string): Promise<FirmExpense> {
    return apiClient.get<FirmExpense>(`/billing/expenses/${id}`);
  }

  /**
   * Create a new expense
   * POST /api/v1/billing/expenses
   */
  async create(expense: CreateExpenseDto): Promise<FirmExpense> {
    return apiClient.post<FirmExpense>('/billing/expenses', expense);
  }

  /**
   * Update an expense
   * PUT /api/v1/billing/expenses/:id
   */
  async update(id: string, expense: UpdateExpenseDto): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}`, expense);
  }

  /**
   * Approve an expense
   * PUT /api/v1/billing/expenses/:id/approve
   */
  async approve(id: string): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}/approve`, {});
  }

  /**
   * Mark an expense as billed
   * PUT /api/v1/billing/expenses/:id/bill
   */
  async bill(id: string, invoiceId: string): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}/bill`, { invoiceId });
  }

  /**
   * Delete an expense
   * DELETE /api/v1/billing/expenses/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/expenses/${id}`);
  }

  /**
   * Upload receipt for expense
   * POST /api/v1/billing/expenses/:id/receipt
   */
  async uploadReceipt(id: string, file: File): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string; filename: string; size: number }>(
      `/billing/expenses/${id}/receipt`, 
      formData
    );
  }

  /**
   * Get expense totals for a case
   * GET /api/v1/billing/expenses/case/:caseId/totals
   */
  async getTotalsByCase(caseId: string): Promise<ExpenseTotals> {
    return apiClient.get<ExpenseTotals>(`/billing/expenses/case/${caseId}/totals`);
  }
}
