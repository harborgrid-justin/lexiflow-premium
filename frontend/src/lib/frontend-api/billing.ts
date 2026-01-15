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
  getOverviewStats,
  getCollections,
  generateARReport,
  sendCollectionReminders,
  // Sub-modules for descriptor compatibility
  timeEntries,
  // Convenience alias
  getAll: getAllTimeEntries,
};
