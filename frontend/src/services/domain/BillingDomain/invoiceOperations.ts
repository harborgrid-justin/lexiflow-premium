/**
 * BillingDomain - Invoice Operations
 * Invoice management and billing operations
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { Invoice, TimeEntry } from "./types";
import { OperationError } from "./types";

/**
 * Get all invoices
 */
export async function getInvoices(): Promise<Invoice[]> {
  try {
    return await apiClient.get<Invoice[]>("/billing/invoices");
  } catch (error) {
    console.error("[BillingRepository.getInvoices] Error:", error);
    throw new OperationError("Failed to fetch invoices");
  }
}

/**
 * Create a new invoice from time entries
 */
export async function createInvoice(
  clientName: string,
  caseId: string,
  entries: TimeEntry[]
): Promise<Invoice> {
  // Validate parameters
  if (!clientName || clientName.trim() === "") {
    throw new Error("[BillingRepository.createInvoice] Invalid clientName parameter");
  }

  if (!caseId || caseId.trim() === "") {
    throw new Error("[BillingRepository.createInvoice] Invalid caseId parameter");
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(
      "[BillingRepository.createInvoice] Time entries array is required and cannot be empty"
    );
  }

  try {
    return await apiClient.post<Invoice>("/billing/invoices", {
      clientName,
      caseId,
      entries: entries.map((e) => e.id),
    });
  } catch (error) {
    console.error("[BillingRepository.createInvoice] Error:", error);
    throw new OperationError("Failed to create invoice");
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice> {
  if (!id || id.trim() === "") {
    throw new Error("[BillingRepository.updateInvoice] Invalid id parameter");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("[BillingRepository.updateInvoice] Invalid updates data");
  }

  try {
    return await apiClient.patch<Invoice>(`/billing/invoices/${id}`, updates);
  } catch (error) {
    console.error("[BillingRepository.updateInvoice] Error:", error);
    throw new OperationError("Failed to update invoice");
  }
}

/**
 * Send an invoice to the client
 */
export async function sendInvoice(id: string): Promise<boolean> {
  if (!id || id.trim() === "") {
    throw new Error("[BillingRepository.sendInvoice] Invalid id parameter");
  }

  try {
    await apiClient.post(`/billing/invoices/${id}/send`);
    return true;
  } catch (error) {
    console.error("[BillingRepository.sendInvoice] Error:", error);
    throw new OperationError("Failed to send invoice");
  }
}
