/**
 * Invoice Service
 * Handles all invoice-related API operations
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";
import { extractPaginatedData, validateId, validateObject } from "./utils";

export class InvoiceService {
  /**
   * Get invoices with optional filters
   */
  async getInvoices(filters?: {
    caseId?: string;
    clientId?: string;
    status?: string;
  }): Promise<unknown[]> {
    try {
      const response = await apiClient.get<
        PaginatedResponse<unknown> | unknown[]
      >("/billing/invoices", filters);

      return extractPaginatedData(response);
    } catch {
      console.warn(
        "[InvoiceService.getInvoices] Invoices endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Create a new invoice
   */
  async createInvoice(data: unknown): Promise<unknown> {
    validateObject(data, "data", "createInvoice");

    try {
      return await apiClient.post<unknown>("/billing/invoices", data);
    } catch (error) {
      console.error("[InvoiceService.createInvoice] Error:", error);
      throw new Error("Failed to create invoice");
    }
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: string, data: unknown): Promise<unknown> {
    validateId(id, "updateInvoice");
    validateObject(data, "data", "updateInvoice");

    try {
      return await apiClient.put<unknown>(`/billing/invoices/${id}`, data);
    } catch (error) {
      console.error("[InvoiceService.updateInvoice] Error:", error);
      throw new Error(`Failed to update invoice with id: ${id}`);
    }
  }

  /**
   * Send an invoice to client
   */
  async sendInvoice(id: string): Promise<unknown> {
    validateId(id, "sendInvoice");

    try {
      return await apiClient.post<unknown>(`/billing/invoices/${id}/send`, {});
    } catch (error) {
      console.error("[InvoiceService.sendInvoice] Error:", error);
      throw new Error(`Failed to send invoice with id: ${id}`);
    }
  }
}

export const invoiceService = new InvoiceService();
