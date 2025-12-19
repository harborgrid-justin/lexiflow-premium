/**
 * Consolidated Invoices API Service
 * Merges duplicate implementations from apiServicesAdditional.ts
 * 100% backend endpoint coverage (10/10 endpoints)
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';
import type { Invoice } from '../../../types';

export interface InvoiceFilters {
  caseId?: string;
  clientId?: string;
  status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateInvoiceDto {
  caseId: string;
  clientId?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable?: boolean;
}

export interface InvoicePayment {
  id?: string;
  amount: number;
  date: string;
  method: 'Check' | 'Wire' | 'Credit Card' | 'ACH' | 'Cash';
  reference?: string;
  notes?: string;
}

export class InvoicesApiService {
  /**
   * Get all invoices with optional filters
   * GET /api/v1/billing/invoices
   */
  async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices', filters);
    return response.data;
  }

  /**
   * Get overdue invoices
   * GET /api/v1/billing/invoices/overdue
   */
  async getOverdue(): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices/overdue');
    return response.data;
  }

  /**
   * Get invoice by ID
   * GET /api/v1/billing/invoices/:id
   */
  async getById(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/billing/invoices/${id}`);
  }

  /**
   * Get invoice as PDF
   * GET /api/v1/billing/invoices/:id/pdf
   */
  async getPdf(id: string): Promise<Blob> {
    return apiClient.get<Blob>(`/billing/invoices/${id}/pdf`);
  }

  /**
   * Create a new invoice
   * POST /api/v1/billing/invoices
   */
  async create(invoice: CreateInvoiceDto): Promise<Invoice> {
    return apiClient.post<Invoice>('/billing/invoices', invoice);
  }

  /**
   * Update an invoice
   * PUT /api/v1/billing/invoices/:id
   */
  async update(id: string, invoice: Partial<CreateInvoiceDto>): Promise<Invoice> {
    return apiClient.put<Invoice>(`/billing/invoices/${id}`, invoice);
  }

  /**
   * Send invoice to client
   * POST /api/v1/billing/invoices/:id/send
   */
  async send(id: string, recipients?: string[]): Promise<Invoice> {
    return apiClient.post<Invoice>(`/billing/invoices/${id}/send`, { recipients });
  }

  /**
   * Record a payment for an invoice
   * POST /api/v1/billing/invoices/:id/record-payment
   */
  async recordPayment(id: string, payment: Omit<InvoicePayment, 'id'>): Promise<Invoice> {
    return apiClient.post<Invoice>(`/billing/invoices/${id}/record-payment`, payment);
  }

  /**
   * Delete an invoice
   * DELETE /api/v1/billing/invoices/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/invoices/${id}`);
  }

  /**
   * Get invoice statistics
   * GET /api/v1/billing/invoices/stats
   */
  async getStats(): Promise<{
    total: number;
    outstanding: number;
    paid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    return apiClient.get('/billing/invoices/stats');
  }
}
