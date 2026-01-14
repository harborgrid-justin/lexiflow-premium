/**
 * Billing Domain Normalizers
 */

import {
  normalizeArray,
  normalizeCurrency,
  normalizeDate,
  normalizeId,
  normalizeNumber,
  normalizeString,
  type Normalizer,
} from "./index";

interface BackendTimeEntry {
  id: string | number;
  case_id?: string;
  attorney_id?: string;
  date?: string;
  hours?: number;
  rate?: number;
  amount?: number;
  description?: string;
  billable?: boolean;
  billed?: boolean;
}

export const normalizeTimeEntry: Normalizer<BackendTimeEntry, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    caseId: normalizeString(backend.case_id),
    attorneyId: normalizeString(backend.attorney_id),
    date: normalizeDate(backend.date),
    hours: normalizeNumber(backend.hours),
    rate: normalizeNumber(backend.rate),
    amount: normalizeNumber(backend.amount),
    description: normalizeString(backend.description),
    billable: backend.billable ?? true,
    billed: backend.billed ?? false,
  };
};

interface BackendInvoice {
  id: string | number;
  invoice_number?: string;
  case_id?: string;
  client_id?: string;
  issue_date?: string;
  due_date?: string;
  amount?: number;
  paid_amount?: number;
  status?: string;
}

export const normalizeInvoice: Normalizer<BackendInvoice, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    invoiceNumber: normalizeString(backend.invoice_number),
    caseId: normalizeString(backend.case_id),
    clientId: normalizeString(backend.client_id),
    issueDate: normalizeDate(backend.issue_date),
    dueDate: normalizeDate(backend.due_date),
    amount: normalizeCurrency(backend.amount),
    paidAmount: normalizeCurrency(backend.paid_amount),
    status: normalizeString(backend.status),
  };
};

export function normalizeTimeEntries(backend: unknown): unknown[] {
  return normalizeArray(backend, (item) =>
    normalizeTimeEntry(item as BackendTimeEntry)
  );
}

export function normalizeInvoices(backend: unknown): unknown[] {
  return normalizeArray(backend, (item) =>
    normalizeInvoice(item as BackendInvoice)
  );
}
