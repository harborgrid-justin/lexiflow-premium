/**
 * Billing Frontend API
 * Domain contract for time entries, invoices, and billing
 */

import {
  normalizeInvoice,
  normalizeInvoices,
  normalizeTimeEntries,
  normalizeTimeEntry,
} from "../normalization/billing";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

// Time Entries
export async function getAllTimeEntries(filters?: {
  caseId?: string;
}): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/time-entries", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeTimeEntries(items));
}

export async function getTimeEntryById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Time entry ID is required"));

  const result = await client.get<unknown>(`/time-entries/${id}`);
  if (!result.ok) return result;

  return success(normalizeTimeEntry(result.data));
}

export async function createTimeEntry(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/time-entries", input);

  if (!result.ok) return result;
  return success(normalizeTimeEntry(result.data));
}

export async function updateTimeEntry(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Time entry ID is required"));

  const result = await client.patch<unknown>(`/time-entries/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeTimeEntry(result.data));
}

// Invoices
export async function getAllInvoices(filters?: {
  caseId?: string;
  clientId?: string;
}): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/invoices", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeInvoices(items));
}

export async function getInvoiceById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Invoice ID is required"));

  const result = await client.get<unknown>(`/invoices/${id}`);
  if (!result.ok) return result;

  return success(normalizeInvoice(result.data));
}

export async function createInvoice(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/invoices", input);

  if (!result.ok) return result;
  return success(normalizeInvoice(result.data));
}

export const billingApi = {
  getAllTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
};
