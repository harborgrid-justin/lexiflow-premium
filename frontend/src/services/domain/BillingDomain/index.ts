/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      LEXIFLOW BILLING DOMAIN SERVICE                      ║
 * ║                  Enterprise Financial Management Layer v2.0               ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/domain/BillingDomain
 * @architecture Backend-First Financial Management with Trust Accounting
 * @author LexiFlow Engineering Team
 * @since 2025-12-22
 * @status PRODUCTION READY
 */

// Export all types
export type {
  Client,
  FinancialPerformanceData,
  Invoice,
  OperatingSummary,
  PaginationParams,
  RateTable,
  TimeEntry,
  TrustTransaction,
  WIPStat,
} from "./types";

export { ComplianceError, OperationError } from "./types";

// Export query keys
export { BILLING_QUERY_KEYS } from "./queryKeys";

// Import base repository and operations
import * as analyticsOps from "./analyticsOperations";
import * as invoiceOps from "./invoiceOperations";
import * as rateOps from "./rateOperations";
import { BillingRepositoryBase } from "./repository";
import * as timeEntryOps from "./timeEntryOperations";
import * as trustOps from "./trustOperations";
import * as utilityOps from "./utilityOperations";

import type {
  Client,
  FinancialPerformanceData,
  Invoice,
  OperatingSummary,
  PaginationParams,
  RateTable,
  TimeEntry,
  TrustTransaction,
  WIPStat,
} from "./types";

/**
 * Billing Repository Class
 * Implements backend-first pattern with complete financial management
 *
 * @class BillingRepository
 * @extends BillingRepositoryBase
 */
export class BillingRepository extends BillingRepositoryBase {
  // =============================================================================
  // CRUD OPERATIONS WITH BACKEND API ROUTING
  // =============================================================================

  override async getAll(): Promise<TimeEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return timeEntryOps.getAllTimeEntries(this.billingApi as any);
  }

  override async getById(id: string): Promise<TimeEntry | undefined> {
    return timeEntryOps.getTimeEntryById(id);
  }

  override async add(
    entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimeEntry> {
    return timeEntryOps.addTimeEntry(entry);
  }

  override async update(
    id: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    return timeEntryOps.updateTimeEntry(id, updates);
  }

  override async delete(id: string): Promise<void> {
    return timeEntryOps.deleteTimeEntry(id);
  }

  // =============================================================================
  // RATE MANAGEMENT
  // =============================================================================

  async getRates(timekeeperId: string): Promise<RateTable[]> {
    return rateOps.getRates(timekeeperId);
  }

  // =============================================================================
  // TIME ENTRY MANAGEMENT
  // =============================================================================

  async getTimeEntries(caseId?: string): Promise<TimeEntry[]> {
    return timeEntryOps.getTimeEntries(this.billingApi, caseId);
  }

  async getPaginatedTimeEntries(
    caseId: string,
    params?: PaginationParams
  ): Promise<{
    data: TimeEntry[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return timeEntryOps.getPaginatedTimeEntries(caseId, params);
  }

  async addTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    return timeEntryOps.addTimeEntryWithValidation(entry);
  }

  // =============================================================================
  // WIP & REALIZATION ANALYTICS
  // =============================================================================

  async getWIPStats(): Promise<WIPStat[]> {
    return analyticsOps.getWIPStats();
  }

  async getRealizationStats(): Promise<unknown> {
    return analyticsOps.getRealizationStats();
  }

  // =============================================================================
  // INVOICE MANAGEMENT
  // =============================================================================

  async getInvoices(): Promise<Invoice[]> {
    return invoiceOps.getInvoices();
  }

  async createInvoice(
    clientName: string,
    caseId: string,
    entries: TimeEntry[]
  ): Promise<Invoice> {
    return invoiceOps.createInvoice(clientName, caseId, entries);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    return invoiceOps.updateInvoice(id, updates);
  }

  async sendInvoice(id: string): Promise<boolean> {
    return invoiceOps.sendInvoice(id);
  }

  // =============================================================================
  // TRUST ACCOUNTING
  // =============================================================================

  async getTrustAccount(
    accountId: string
  ): Promise<{ id: string; type: string }> {
    return trustOps.getTrustAccount(accountId);
  }

  async getTrustTransactions(
    accountId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      includeInterest?: boolean;
      verifyReconciliation?: boolean;
    }
  ): Promise<TrustTransaction[]> {
    return trustOps.getTrustTransactions(accountId, options);
  }

  async getTrustAccounts(): Promise<unknown[]> {
    return trustOps.getTrustAccounts();
  }

  async getTopAccounts(): Promise<Client[]> {
    return analyticsOps.getTopAccounts();
  }

  async getOverviewStats(): Promise<{
    realization: number;
    totalBilled: number;
    month: string;
  }> {
    return analyticsOps.getOverviewStats();
  }

  async getOperatingSummary(): Promise<OperatingSummary> {
    return analyticsOps.getOperatingSummary();
  }

  async getFinancialPerformance(): Promise<FinancialPerformanceData> {
    return analyticsOps.getFinancialPerformance();
  }

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  async sync(): Promise<void> {
    return utilityOps.sync();
  }

  async export(format: string): Promise<string> {
    return utilityOps.exportBillingData(format);
  }
}
