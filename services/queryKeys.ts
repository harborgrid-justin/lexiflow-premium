/**
 * @module services/queryKeys
 * @description Type-safe query key factory for React Query
 * Provides consistent cache key generation and prevents typos
 */

import { STORES } from './db';
import type { CaseId, DocumentId, UserId } from '../types';

/**
 * Correspondence query keys factory
 * Hierarchical structure: all > lists > detail
 */
export const correspondenceKeys = {
  all: [STORES.COMMUNICATIONS] as const,
  lists: () => [...correspondenceKeys.all, 'list'] as const,
  list: (filters?: CorrespondenceFilters) => 
    [...correspondenceKeys.lists(), filters] as const,
  details: () => [...correspondenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...correspondenceKeys.details(), id] as const,
  drafts: () => [...correspondenceKeys.all, 'drafts'] as const,
  byCase: (caseId: CaseId) => 
    [...correspondenceKeys.all, 'byCase', caseId] as const,
  byUser: (userId: UserId) => 
    [...correspondenceKeys.all, 'byUser', userId] as const,
} as const;

/**
 * Service Jobs query keys factory
 */
export const serviceJobKeys = {
  all: [STORES.SERVICE_JOBS] as const,
  lists: () => [...serviceJobKeys.all, 'list'] as const,
  list: (filters?: ServiceJobFilters) => 
    [...serviceJobKeys.lists(), filters] as const,
  details: () => [...serviceJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceJobKeys.details(), id] as const,
  byCase: (caseId: CaseId) => 
    [...serviceJobKeys.all, 'byCase', caseId] as const,
  byStatus: (status: string) => 
    [...serviceJobKeys.all, 'byStatus', status] as const,
  pending: () => [...serviceJobKeys.all, 'pending'] as const,
} as const;

/**
 * Combined correspondence and service query keys
 */
export const correspondenceQueryKeys = {
  correspondence: correspondenceKeys,
  serviceJobs: serviceJobKeys,
} as const;

// Filter types
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

/**
 * Evidence query keys factory
 * Hierarchical structure supporting inventory, custody, and forensics
 */
export const evidenceKeys = {
  all: [STORES.EVIDENCE] as const,
  lists: () => [...evidenceKeys.all, 'list'] as const,
  list: (filters?: EvidenceFilters) => 
    [...evidenceKeys.lists(), filters] as const,
  details: () => [...evidenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...evidenceKeys.details(), id] as const,
  byCase: (caseId: CaseId) => 
    [...evidenceKeys.all, 'byCase', caseId] as const,
  byCustodian: (custodian: string) => 
    [...evidenceKeys.all, 'byCustodian', custodian] as const,
  custody: (id: string) => 
    [...evidenceKeys.detail(id), 'custody'] as const,
  forensics: (id: string) => 
    [...evidenceKeys.detail(id), 'forensics'] as const,
  verification: (id: string) => 
    [...evidenceKeys.detail(id), 'verification'] as const,
  byAdmissibility: (status: string) => 
    [...evidenceKeys.all, 'admissibility', status] as const,
} as const;

/**
 * Combined evidence query keys
 */
export const evidenceQueryKeys = {
  evidence: evidenceKeys,
} as const;

// Evidence filter types
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

// Discovery filter types
export interface DiscoveryFilters {
  search?: string;
  type?: string;
  status?: string;
  caseId?: string;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
}

/**
 * Billing query keys factory
 * Hierarchical structure supporting WIP, invoices, expenses, trust accounts, and financial reporting
 */
export const billingKeys = {
  all: [STORES.BILLING] as const,
  lists: () => [...billingKeys.all, 'list'] as const,
  list: (filters?: BillingFilters) => 
    [...billingKeys.lists(), filters] as const,
  details: () => [...billingKeys.all, 'detail'] as const,
  detail: (id: string) => [...billingKeys.details(), id] as const,
  
  // WIP (Work in Progress)
  wip: () => [...billingKeys.all, 'wip'] as const,
  wipByCase: (caseId: CaseId) => 
    [...billingKeys.wip(), 'byCase', caseId] as const,
  wipByUser: (userId: UserId) => 
    [...billingKeys.wip(), 'byUser', userId] as const,
  wipStats: () => [...billingKeys.wip(), 'stats'] as const,
  
  // Invoices
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoiceList: (filters?: InvoiceFilters) => 
    [...billingKeys.invoices(), 'list', filters] as const,
  invoice: (id: string) => 
    [...billingKeys.invoices(), id] as const,
  invoicesByCase: (caseId: CaseId) => 
    [...billingKeys.invoices(), 'byCase', caseId] as const,
  invoicesByStatus: (status: string) => 
    [...billingKeys.invoices(), 'byStatus', status] as const,
  
  // Expenses
  expenses: () => [...billingKeys.all, 'expenses'] as const,
  expenseList: (filters?: ExpenseFilters) => 
    [...billingKeys.expenses(), 'list', filters] as const,
  expensesByCase: (caseId: CaseId) => 
    [...billingKeys.expenses(), 'byCase', caseId] as const,
  
  // Trust Accounts
  trust: () => [...billingKeys.all, 'trust'] as const,
  trustAccounts: () => [...billingKeys.trust(), 'accounts'] as const,
  trustTransactions: (accountId: string) => 
    [...billingKeys.trust(), 'transactions', accountId] as const,
  trustByClient: (clientId: string) => 
    [...billingKeys.trust(), 'byClient', clientId] as const,
  
  // Financial Reporting
  realization: () => [...billingKeys.all, 'realization'] as const,
  realizationData: (period: string) => 
    [...billingKeys.realization(), period] as const,
  topClients: (period: string) => 
    [...billingKeys.all, 'topClients', period] as const,
  collections: () => [...billingKeys.all, 'collections'] as const,
  collectionRate: (period: string) => 
    [...billingKeys.collections(), period] as const,
} as const;

/**
 * Combined billing query keys
 */
export const billingQueryKeys = {
  billing: billingKeys,
} as const;

// Billing filter types
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
