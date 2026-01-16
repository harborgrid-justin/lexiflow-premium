/**
 * Billing Frontend API
 * Enterprise-grade API layer for time entries, invoices, and billing
 *
 * @module lib/frontend-api/billing
 * @description Domain-level contract for billing operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 */

import {
  normalizeInvoice,
  normalizeInvoices,
  normalizeTimeEntries,
  normalizeTimeEntry,
} from "../normalization/billing";
import { client } from "./client";
import { ValidationError } from "./errors";
import { failure, type Result, success } from "./types";
import type { BillingRate, FeeAgreement, RateTable } from "@/types";

export interface TimeEntryFilters {
  caseId?: string;
  attorneyId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "draft" | "submitted" | "approved" | "billed";
  page?: number;
  limit?: number;
}

export interface CreateTimeEntryInput {
  caseId: string;
  attorneyId: string;
  date: string | Date;
  hours: number;
  description: string;
}

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

export async function updateInvoice(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Invoice ID is required"));

  const result = await client.put<unknown>(`/invoices/${id}`, input);
  if (!result.ok) return result;
  return success(normalizeInvoice(result.data));
}

export async function deleteInvoice(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Invoice ID is required"));
  return client.delete<void>(`/invoices/${id}`);
}

// Transactions
export async function getAllTransactions(filters?: {
  caseId?: string;
  status?: string;
  type?: string;
}): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/billing/transactions", { params });
  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export async function createTransaction(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/billing/transactions", input);
  if (!result.ok) return result;
  return success(result.data);
}

// Billing Rates
export async function getBillingRates(): Promise<Result<BillingRate[]>> {
  const result = await client.get<unknown>("/billing/rates");
  if (!result.ok) return result;
  return success(
    Array.isArray(result.data) ? (result.data as BillingRate[]) : []
  );
}

// Rate Tables
export async function getRateTables(): Promise<Result<RateTable[]>> {
  const result = await client.get<unknown>("/billing/rates");
  if (!result.ok) return result;
  return success(
    Array.isArray(result.data) ? (result.data as RateTable[]) : []
  );
}

export async function createRateTable(
  input: Partial<RateTable>
): Promise<Result<RateTable>> {
  const result = await client.post<RateTable>("/billing/rates", input);
  if (!result.ok) return result;
  return success(result.data);
}

export async function updateRateTable(
  id: string,
  input: Partial<RateTable>
): Promise<Result<RateTable>> {
  if (!id) return failure(new ValidationError("Rate table ID is required"));
  const result = await client.put<RateTable>(`/billing/rates/${id}`, input);
  if (!result.ok) return result;
  return success(result.data);
}

export async function deleteRateTable(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Rate table ID is required"));
  return client.delete<void>(`/billing/rates/${id}`);
}

// Fee Agreements
export async function getFeeAgreements(filters?: {
  clientId?: string;
  caseId?: string;
  status?: string;
}): Promise<Result<FeeAgreement[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/billing/fee-agreements", {
    params,
  });
  if (!result.ok) return result;
  return success(
    Array.isArray(result.data) ? (result.data as FeeAgreement[]) : []
  );
}

export async function createFeeAgreement(
  input: Partial<FeeAgreement>
): Promise<Result<FeeAgreement>> {
  const result = await client.post<FeeAgreement>(
    "/billing/fee-agreements",
    input
  );
  if (!result.ok) return result;
  return success(result.data);
}

export async function updateFeeAgreement(
  id: string,
  input: Partial<FeeAgreement>
): Promise<Result<FeeAgreement>> {
  if (!id) return failure(new ValidationError("Fee agreement ID is required"));
  const result = await client.put<FeeAgreement>(
    `/billing/fee-agreements/${id}`,
    input
  );
  if (!result.ok) return result;
  return success(result.data);
}

export async function deleteFeeAgreement(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Fee agreement ID is required"));
  return client.delete<void>(`/billing/fee-agreements/${id}`);
}

// Enterprise / Dashboard
export async function getOverviewStats(): Promise<Result<unknown>> {
  const result = await client.get<unknown>("/billing/analytics/overview");
  if (!result.ok) return result;
  return success(result.data);
}

export async function getCollections(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/billing/collections");
  if (!result.ok) return result;
  return success(Array.isArray(result.data) ? result.data : []);
}

export async function generateARReport(): Promise<Result<unknown>> {
  return client.post("/billing/reports/ar-aging", {});
}

export async function sendCollectionReminders(): Promise<Result<unknown>> {
  return client.post("/billing/collections/reminders", {});
}

/**
 * Time Entries sub-module (for descriptor compatibility)
 */
const timeEntries = {
  getAll: getAllTimeEntries,
  getById: getTimeEntryById,
  create: createTimeEntry,
  update: updateTimeEntry,
};

export const billingApi = {
  getAllTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getAllTransactions,
  createTransaction,
  getBillingRates,
  getRateTables,
  createRateTable,
  updateRateTable,
  deleteRateTable,
  getFeeAgreements,
  createFeeAgreement,
  updateFeeAgreement,
  deleteFeeAgreement,
  getOverviewStats,
  getCollections,
  generateARReport,
  sendCollectionReminders,
  // Sub-modules for descriptor compatibility
  timeEntries,
  // Convenience alias
  getAll: getAllTimeEntries,
};
