/**
 * Discovery Domain Normalizers
 */

import {
  normalizeArray,
  normalizeBoolean,
  normalizeDate,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./core";

interface BackendEvidence {
  id: string | number;
  evidence_number?: string;
  description?: string;
  evidence_type?: string;
  chain_of_custody?: string;
  location?: string;
  collected_date?: string;
  is_privileged?: boolean;
  case_id?: string;
  custodian_id?: string;
}

export const normalizeEvidence: Normalizer<BackendEvidence, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    evidenceNumber: normalizeString(backend.evidence_number),
    description: normalizeString(backend.description),
    evidenceType: normalizeString(backend.evidence_type),
    chainOfCustody: normalizeString(backend.chain_of_custody),
    location: normalizeString(backend.location),
    collectedDate: normalizeDate(backend.collected_date),
    isPrivileged: normalizeBoolean(backend.is_privileged),
    caseId: normalizeString(backend.case_id),
    custodianId: normalizeString(backend.custodian_id),
  };
};

export function normalizeEvidenceArray(backend: unknown): unknown[] {
  return normalizeArray(backend, (item) =>
    normalizeEvidence(item as BackendEvidence)
  );
}
