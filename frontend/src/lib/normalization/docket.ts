/**
 * Docket Domain Normalizers
 * Transform backend docket data to frontend format
 */

import type { DocketEntry } from "@/types";
import {
  normalizeArray,
  normalizeDate,
  normalizeId,
  normalizeNumber,
  normalizeString,
  type Normalizer,
} from "./index";

interface BackendDocketEntry {
  id: string | number;
  docket_number?: string;
  entry_date?: string;
  filing_date?: string;
  description?: string;
  document_type?: string;
  filed_by?: string;
  case_id?: string;
  document_id?: string;
  page_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const normalizeDocketEntry: Normalizer<
  BackendDocketEntry,
  DocketEntry
> = (backend) => {
  return {
    id: normalizeId(backend.id),
    docketNumber: normalizeString(backend.docket_number),
    entryDate: normalizeDate(backend.entry_date),
    filingDate: normalizeDate(backend.filing_date),
    description: normalizeString(backend.description),
    documentType: normalizeString(backend.document_type),
    filedBy: normalizeString(backend.filed_by),
    caseId: normalizeString(backend.case_id),
    documentId: normalizeString(backend.document_id),
    pageCount: normalizeNumber(backend.page_count),
    createdAt: normalizeDate(backend.created_at) || new Date(),
    updatedAt: normalizeDate(backend.updated_at) || new Date(),
  } as DocketEntry;
};

export function normalizeDocketEntries(backendEntries: unknown): DocketEntry[] {
  return normalizeArray(backendEntries, normalizeDocketEntry);
}

export function denormalizeDocketEntry(
  frontend: Partial<DocketEntry>
): Partial<BackendDocketEntry> {
  const backend: Partial<BackendDocketEntry> = {};
  if (frontend.docketNumber !== undefined)
    backend.docket_number = frontend.docketNumber;
  if (frontend.description !== undefined)
    backend.description = frontend.description;
  if (frontend.documentType !== undefined)
    backend.document_type = frontend.documentType;
  if (frontend.filedBy !== undefined) backend.filed_by = frontend.filedBy;
  if (frontend.caseId !== undefined) backend.case_id = frontend.caseId;
  if (frontend.pageCount !== undefined) backend.page_count = frontend.pageCount;
  return backend;
}
