/**
 * Invoices Service
 * Handles invoice generation, management, and payment tracking
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  caseName?: string;
  clientId: string;
  clientName?: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void';
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
  createdBy?: string;
  sentDate?: Date;
  remindersSent?: number;
  lastReminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  type: 'time' | 'expense' | 'flat_fee' | 'adjustment';
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  date?: Date;
  referenceId?: string;
}

export interface CreateInvoiceRequest {
  caseId: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  timeEntryIds?: string[];
  expenseIds?: string[];
  notes?: string;
  paymentTerms?: string;
  discount?: number;
  tax?: number;
}

export interface UpdateInvoiceRequest {
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  paymentTerms?: string;
  discount?: number;
  tax?: number;
  status?: Invoice['status'];
}

export interface InvoicesListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

export interface InvoiceStatistics {
  total: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  byStatus: Record<Invoice['status'], { count: number; amount: number }>;
  averageDaysToPay: number;
  overdueCount: number;
  overdueAmount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
}

/**
 * Get invoices with filters
 */
export async function getInvoices(params?: PaginationParams & {
  caseId?: string;
  clientId?: string;
  status?: Invoice['status'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Promise<InvoicesListResponse> {
  try {
    const response = await apiClient.get<InvoicesListResponse>(
      API_ENDPOINTS.BILLING.INVOICES,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  try {
    const response = await apiClient.get<Invoice>(
      API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get invoice line items
 */
export async function getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
  try {
    const response = await apiClient.get<InvoiceLineItem[]>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(invoiceId)}/line-items`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate/create new invoice
 */
export async function createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
  try {
    const response = await apiClient.post<Invoice>(
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
  data: UpdateInvoiceRequest
): Promise<Invoice> {
  try {
    const response = await apiClient.put<Invoice>(
      API_ENDPOINTS.BILLING.INVOICE_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.BILLING.INVOICE_BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Send invoice to client
 */
export async function sendInvoice(id: string, emails?: string[]): Promise<Invoice> {
  try {
    const response = await apiClient.post<Invoice>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/send`,
      { emails }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  amount: number,
  paymentDate?: Date,
  paymentMethod?: string
): Promise<Invoice> {
  try {
    const response = await apiClient.post<Invoice>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/pay`,
      {
        amount,
        paymentDate: paymentDate || new Date(),
        paymentMethod,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Record partial payment
 */
export async function recordPayment(
  id: string,
  amount: number,
  paymentDate: Date,
  paymentMethod: string,
  referenceNumber?: string,
  notes?: string
): Promise<PaymentRecord> {
  try {
    const response = await apiClient.post<PaymentRecord>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/payments`,
      {
        amount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get invoice payments
 */
export async function getInvoicePayments(invoiceId: string): Promise<PaymentRecord[]> {
  try {
    const response = await apiClient.get<PaymentRecord[]>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(invoiceId)}/payments`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Void invoice
 */
export async function voidInvoice(id: string, reason?: string): Promise<Invoice> {
  try {
    const response = await apiClient.post<Invoice>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/void`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(id: string): Promise<Invoice> {
  try {
    const response = await apiClient.post<Invoice>(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/remind`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoicePDF(id: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}/pdf`,
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
 * Get invoice statistics
 */
export async function getInvoiceStatistics(params?: {
  caseId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<InvoiceStatistics> {
  try {
    const response = await apiClient.get<InvoiceStatistics>(
      `${API_ENDPOINTS.BILLING.INVOICES}/statistics`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices(): Promise<Invoice[]> {
  try {
    const response = await apiClient.get<Invoice[]>(
      `${API_ENDPOINTS.BILLING.INVOICES}/overdue`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Preview invoice before creation
 */
export async function previewInvoice(data: CreateInvoiceRequest): Promise<{
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  lineItems: InvoiceLineItem[];
}> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.BILLING.INVOICES}/preview`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getInvoices,
  getInvoiceById,
  getInvoiceLineItems,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markInvoiceAsPaid,
  recordPayment,
  getInvoicePayments,
  voidInvoice,
  sendPaymentReminder,
  downloadInvoicePDF,
  getInvoiceStatistics,
  getOverdueInvoices,
  previewInvoice,
};
