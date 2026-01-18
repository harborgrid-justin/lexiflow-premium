/**
 * Consolidated Invoices API Service
 * Merges duplicate implementations from apiServicesAdditional.ts
 * 100% backend endpoint coverage (10/10 endpoints)
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";

import { type CreateInvoiceDto, type Invoice } from "@/types";

export interface InvoiceFilters {
  caseId?: string;
  clientId?: string;
  status?: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface InvoicePayment {
  id?: string;
  amount: number;
  date: string;
  method: "Check" | "Wire" | "Credit Card" | "ACH" | "Cash";
  reference?: string;
  notes?: string;
}

export class InvoicesApiService {
  /**
   * Get all invoices with optional filters
   * GET ${API_PREFIX}/billing/invoices
   */
  async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>(
      "/billing/invoices",
      filters as Record<string, unknown>,
    );
    return response.data;
  }

  /**
   * Get overdue invoices
   * GET ${API_PREFIX}/billing/invoices/overdue
   */
  async getOverdue(): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>(
      "/billing/invoices/overdue",
    );
    return response.data;
  }

  /**
   * Get invoice by ID
   * GET ${API_PREFIX}/billing/invoices/:id
   */
  async getById(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/billing/invoices/${id}`);
  }

  /**
   * Get invoice as PDF
   * GET ${API_PREFIX}/billing/invoices/:id/pdf
   */
  async getPdf(id: string): Promise<Blob> {
    return apiClient.get<Blob>(`/billing/invoices/${id}/pdf`);
  }

  /**
   * Create a new invoice
   * POST ${API_PREFIX}/billing/invoices
   */
  async create(invoice: CreateInvoiceDto): Promise<Invoice> {
    return apiClient.post<Invoice>("/billing/invoices", invoice);
  }

  /**
   * Update an invoice
   * PUT ${API_PREFIX}/billing/invoices/:id
   */
  async update(
    id: string,
    invoice: Partial<CreateInvoiceDto>,
  ): Promise<Invoice> {
    return apiClient.put<Invoice>(`/billing/invoices/${id}`, invoice);
  }

  /**
   * Send invoice to client
   * POST ${API_PREFIX}/billing/invoices/:id/send
   */
  async send(id: string, recipients?: string[]): Promise<Invoice> {
    return apiClient.post<Invoice>(`/billing/invoices/${id}/send`, {
      recipients,
    });
  }

  /**
   * Record a payment for an invoice
   * POST ${API_PREFIX}/billing/invoices/:id/record-payment
   */
  async recordPayment(
    id: string,
    payment: Omit<InvoicePayment, "id">,
  ): Promise<Invoice> {
    return apiClient.post<Invoice>(
      `/billing/invoices/${id}/record-payment`,
      payment,
    );
  }

  /**
   * Delete an invoice
   * DELETE ${API_PREFIX}/billing/invoices/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/invoices/${id}`);
  }

  /**
   * Get invoice statistics
   * GET ${API_PREFIX}/billing/invoices/stats
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
    return apiClient.get("/billing/invoices/stats");
  }
}
