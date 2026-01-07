/**
 * Billing Gateway
 *
 * Domain-specific wrapper for billing and invoice operations.
 * Encapsulates business logic for financial operations.
 *
 * @module services/data/api/gateways/billingGateway
 */

import {
  authDelete,
  authGet,
  authPost,
  authPut,
} from "../../client/authTransport";

// Domain types
export interface Invoice {
  id: string;
  number: string;
  caseId?: string;
  clientId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "card" | "check" | "wire" | "ach";
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  createdAt: string;
}

export interface BillingMetrics {
  totalRevenue: number;
  outstandingBalance: number;
  averageInvoiceAmount: number;
  collectionRate: number;
}

/**
 * Billing Gateway
 */
export const billingGateway = {
  /**
   * Get all invoices
   */
  async getAllInvoices(): Promise<Invoice[]> {
    return authGet<Invoice[]>("/invoices");
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    return authGet<Invoice>(`/invoices/${id}`);
  },

  /**
   * Create new invoice
   */
  async createInvoice(
    data: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ): Promise<Invoice> {
    return authPost<Invoice>("/invoices", data);
  },

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return authPut<Invoice>(`/invoices/${id}`, data);
  },

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    return authDelete<void>(`/invoices/${id}`);
  },

  /**
   * Get invoices for a specific case
   */
  async getInvoicesByCase(caseId: string): Promise<Invoice[]> {
    return authGet<Invoice[]>("/invoices", { params: { caseId } });
  },

  /**
   * Get invoices for a specific client
   */
  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return authGet<Invoice[]>("/invoices", { params: { clientId } });
  },

  /**
   * Record payment for invoice
   */
  async recordPayment(
    invoiceId: string,
    payment: Omit<Payment, "id" | "invoiceId" | "createdAt">
  ): Promise<Payment> {
    return authPost<Payment>(`/invoices/${invoiceId}/payments`, payment);
  },

  /**
   * Get payments for invoice
   */
  async getPayments(invoiceId: string): Promise<Payment[]> {
    return authGet<Payment[]>(`/invoices/${invoiceId}/payments`);
  },

  /**
   * Get billing metrics
   */
  async getMetrics(): Promise<BillingMetrics> {
    return authGet<BillingMetrics>("/billing/metrics");
  },

  /**
   * Send invoice to client
   */
  async sendInvoice(id: string): Promise<void> {
    return authPost<void>(`/invoices/${id}/send`);
  },

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string): Promise<Invoice> {
    return authPost<Invoice>(`/invoices/${id}/mark-paid`);
  },
};
