/**
 * @module services/queryKeys
 * @description Type-safe query key factory for React Query
 * Provides consistent cache key generation and prevents typos
 * 
 * @deprecated Use queryKeys from '@/utils/queryKeys' instead.
 * This file is maintained for backward compatibility.
 */

import { queryKeys } from '@/utils/queryKeys';
import type { CaseId, UserId } from '@/types';

// Re-export types for backward compatibility
export interface CorrespondenceFilters {
  caseId?: CaseId;
  type?: string;
  direction?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  isPrivileged?: boolean;
}

export interface ServiceJobFilters {
  caseId?: CaseId;
  status?: string;
  method?: string;
  serverName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EvidenceFilters {
  search?: string;
  type?: string;
  admissibility?: string;
  caseId?: string;
  custodian?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  tags?: string;
  collectedBy?: string;
  hasBlockchain?: boolean;
}

export interface DiscoveryFilters {
  search?: string;
  type?: string;
  status?: string;
  caseId?: string;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
}

export interface BillingFilters {
  search?: string;
  caseId?: CaseId;
  userId?: UserId;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  billable?: boolean;
}

export interface InvoiceFilters {
  search?: string;
  caseId?: CaseId;
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  overdue?: boolean;
}

export interface ExpenseFilters {
  search?: string;
  caseId?: CaseId;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  reimbursable?: boolean;
  status?: string;
}

// Re-export keys from centralized source
export const correspondenceKeys = queryKeys.correspondence;
export const serviceJobKeys = queryKeys.serviceJobs;

export const correspondenceQueryKeys = {
  correspondence: correspondenceKeys,
  serviceJobs: serviceJobKeys,
} as const;

export const evidenceKeys = queryKeys.evidence;

export const evidenceQueryKeys = {
  evidence: evidenceKeys,
} as const;

export const discoveryKeys = queryKeys.discovery;

export const discoveryQueryKeys = {
  discovery: discoveryKeys,
} as const;

export const billingKeys = queryKeys.billing;

export const billingQueryKeys = {
  billing: billingKeys,
} as const;
