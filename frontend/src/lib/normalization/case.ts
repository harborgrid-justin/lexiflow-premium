/**
 * Case Domain Normalizers
 * Transform backend case data to frontend format
 *
 * @module lib/normalization/case
 * @description Case-specific normalizers following enterprise patterns:
 * - Backend snake_case → Frontend camelCase
 * - String dates → Date objects
 * - Backend enums → Frontend enums
 * - Nested relations flattened when appropriate
 */

import type { Case } from "@/types";
import {
  normalizeArray,
  normalizeDate,
  normalizeEnum,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./core";

/**
 * Backend case status mapping
 */
const CASE_STATUS_MAP: Record<string, Case["status"]> = {
  pending: "Pre-Filing",
  "pre-filing": "Pre-Filing",
  open: "Open",
  active: "Active",
  discovery: "Discovery",
  trial: "Trial",
  settled: "Settled",
  closed: "Closed",
  archived: "Archived",
  on_hold: "On Hold",
  "on-hold": "On Hold",
};

/**
 * Backend matter type mapping
 */
const MATTER_TYPE_MAP: Record<string, Case["matterType"]> = {
  general: "General",
  civil: "Civil Litigation",
  criminal: "Criminal Defense",
  corporate: "Corporate",
  family: "Family Law",
  real_estate: "Real Estate",
  ip: "Intellectual Property",
  employment: "Employment",
  tax: "Tax",
  bankruptcy: "Bankruptcy",
};

/**
 * Backend case structure (as received from API)
 */
interface BackendCase {
  id: string | number;
  case_number?: string;
  title?: string;
  description?: string;
  status?: string;
  practice_area?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filing_date?: string;
  close_date?: string;
  client_id?: string;
  client_name?: string;
  lead_attorney_id?: string;
  lead_attorney_name?: string;
  estimated_value?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  archived_at?: string;
}

/**
 * Normalize single case from backend to frontend
 */
export const normalizeCase: Normalizer<BackendCase, Case> = (backend) => {
  return {
    id: normalizeId(backend.id),
    caseNumber: normalizeString(backend.case_number),
    title: normalizeString(backend.title),
    description: normalizeString(backend.description),
    status: normalizeEnum(backend.status, CASE_STATUS_MAP, "Active"),
    matterType: normalizeEnum(
      backend.practice_area,
      MATTER_TYPE_MAP,
      "General"
    ),
    jurisdiction: normalizeString(backend.jurisdiction),
    court: normalizeString(backend.court),
    judge: normalizeString(backend.judge),
    filingDate: normalizeDate(backend.filing_date),
    closeDate: normalizeDate(backend.close_date),
    clientId: normalizeString(backend.client_id),
    clientName: normalizeString(backend.client_name),
    leadAttorneyId: normalizeString(backend.lead_attorney_id),
    leadAttorneyName: normalizeString(backend.lead_attorney_name),
    estimatedValue: backend.estimated_value || 0,
    tags: normalizeArray(backend.tags, normalizeString),
    createdAt: normalizeDate(backend.created_at) || new Date(),
    updatedAt: normalizeDate(backend.updated_at) || new Date(),
    archivedAt: normalizeDate(backend.archived_at),
  } as Case;
};

/**
 * Normalize array of cases
 */
export function normalizeCases(backendCases: unknown): Case[] {
  return normalizeArray(backendCases, normalizeCase);
}

/**
 * Denormalize frontend case to backend format (for updates)
 */
export function denormalizeCase(
  frontendCase: Partial<Case>
): Partial<BackendCase> {
  const backend: Partial<BackendCase> = {};

  if (frontendCase.caseNumber !== undefined) {
    backend.case_number = frontendCase.caseNumber;
  }
  if (frontendCase.title !== undefined) {
    backend.title = frontendCase.title;
  }
  if (frontendCase.description !== undefined) {
    backend.description = frontendCase.description;
  }
  if (frontendCase.status !== undefined) {
    // Reverse mapping
    const statusEntry = Object.entries(CASE_STATUS_MAP).find(
      ([_, v]) => v === frontendCase.status
    );
    backend.status = statusEntry?.[0] || "active";
  }
  if (frontendCase.matterType !== undefined) {
    const typeEntry = Object.entries(MATTER_TYPE_MAP).find(
      ([_, v]) => v === frontendCase.matterType
    );
    backend.practice_area = typeEntry?.[0] || "general";
  }
  if (frontendCase.jurisdiction !== undefined) {
    backend.jurisdiction = frontendCase.jurisdiction;
  }
  if (frontendCase.court !== undefined) {
    backend.court = frontendCase.court;
  }
  if (frontendCase.judge !== undefined) {
    backend.judge = frontendCase.judge;
  }
  if (frontendCase.filingDate !== undefined) {
    backend.filing_date = frontendCase.filingDate?.toISOString();
  }
  if (frontendCase.clientId !== undefined) {
    backend.client_id = frontendCase.clientId;
  }
  if (frontendCase.leadAttorneyId !== undefined) {
    backend.lead_attorney_id = frontendCase.leadAttorneyId;
  }
  if (frontendCase.estimatedValue !== undefined) {
    backend.estimated_value = frontendCase.estimatedValue;
  }
  if (frontendCase.tags !== undefined) {
    backend.tags = frontendCase.tags;
  }

  return backend;
}
