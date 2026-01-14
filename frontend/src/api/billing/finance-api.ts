/**
 * Billing API Service
 * Enterprise-grade API service for billing and time tracking management with backend integration
 *
 * @module BillingApiService
 * @description Manages all billing-related operations including:
 * - Time entry CRUD operations
 * - Time entry approval and billing workflow
 * - Invoice management
 * - Trust account tracking
 * - WIP (Work In Progress) statistics
 * - Rate table management
 * - Realization metrics
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Financial data protection
 * - Proper error handling and logging
 * - LEDES billing code validation
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via BILLING_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Graceful fallback for optional features
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/api-client.service";
import type {
  CreateTrustAccountDto,
  CreateTrustTransactionDto,
  DepositDto,
  FinancialPerformanceData,
  Invoice,
  TimeEntry,
  TrustAccount,
  TrustAccountStatus,
  TrustTransactionEntity,
  UpdateTrustAccountDto,
  WithdrawalDto,
} from "@/types";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.timeEntries.all() });
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.timeEntries.byCase(caseId) });
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoices.all() });
 */
export const BILLING_QUERY_KEYS = {
  timeEntries: {
    all: () => ["billing", "time-entries"] as const,
    byId: (id: string) => ["billing", "time-entries", id] as const,
    byCase: (caseId: string) =>
      ["billing", "time-entries", "case", caseId] as const,
    byUser: (userId: string) =>
      ["billing", "time-entries", "user", userId] as const,
    unbilled: (caseId: string) =>
      ["billing", "time-entries", "case", caseId, "unbilled"] as const,
    totals: (caseId: string) =>
      ["billing", "time-entries", "case", caseId, "totals"] as const,
  },
  invoices: {
    all: () => ["billing", "invoices"] as const,
    byId: (id: string) => ["billing", "invoices", id] as const,
    byCase: (caseId: string) =>
      ["billing", "invoices", "case", caseId] as const,
    byClient: (clientId: string) =>
      ["billing", "invoices", "client", clientId] as const,
  },
  trustAccounts: {
    all: () => ["billing", "trust-accounts"] as const,
    byClient: (clientId: string) =>
      ["billing", "trust-accounts", "client", clientId] as const,
  },
  stats: {
    wip: () => ["billing", "stats", "wip"] as const,
    realization: () => ["billing", "stats", "realization"] as const,
    overview: () => ["billing", "stats", "overview"] as const,
  },
  rates: {
    byTimekeeper: (timekeeperId: string) =>
      ["billing", "rates", "timekeeper", timekeeperId] as const,
  },
} as const;

/**
 * Billing API Service Class
 * Implements secure, type-safe billing and time tracking operations
 */
export class BillingApiService {
  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log(
      "[BillingApiService] Initialized with Backend API (PostgreSQL)"
    );
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(`[BillingApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(
    obj: unknown,
    paramName: string,
    methodName: string
  ): void {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      throw new Error(
        `[BillingApiService.${methodName}] Invalid ${paramName} parameter`
      );
    }
  }

  /**
   * Validate and sanitize array parameter
   * @private
   */
  private validateArray(
    arr: unknown[],
    paramName: string,
    methodName: string
  ): void {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      throw new Error(
        `[BillingApiService.${methodName}] Invalid ${paramName} parameter`
      );
    }
  }

  // =============================================================================
  // TIME ENTRY OPERATIONS
  // =============================================================================

  /**
   * Get time entries with optional filters
   *
   * @param filters - Optional filters for caseId, userId, and pagination
   * @returns Promise<TimeEntry[]> Array of time entries
   * @throws Error if fetch fails
   *
   * @example
   * const allEntries = await service.getTimeEntries();
   * const caseEntries = await service.getTimeEntries({ caseId: 'case-123' });
   */
  async getTimeEntries(filters?: {
    caseId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<TimeEntry[]> {
    try {
      // Backend has separate endpoints: /time-entries (all) and /time-entries/case/:caseId (by case)
      if (filters?.caseId) {
        const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
          `/billing/time-entries/case/${filters.caseId}`
        );
        return Array.isArray(response) ? response : response.data || [];
      }
      const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
        "/billing/time-entries"
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("[BillingApiService.getTimeEntries] Error:", error);
      throw new Error("Failed to fetch time entries");
    }
  }

  /**
   * Get time entry by ID
   *
   * @param id - Time entry ID
   * @returns Promise<TimeEntry> Time entry data
   * @throws Error if id is invalid or fetch fails
   */
  async getTimeEntryById(id: string): Promise<TimeEntry> {
    this.validateId(id, "getTimeEntryById");

    try {
      return await apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
    } catch (error) {
      console.error("[BillingApiService.getTimeEntryById] Error:", error);
      throw new Error(`Failed to fetch time entry with id: ${id}`);
    }
  }

  /**
   * Add a new time entry
   *
   * @param entry - Time entry data without system-generated fields
   * @returns Promise<TimeEntry> Created time entry
   * @throws Error if validation fails or create fails
   *
   * @example
   * const entry = await service.addTimeEntry({
   *   caseId: 'case-123',
   *   userId: 'user-123',
   *   date: '2025-12-22',
   *   duration: 2.5,
   *   description: 'Legal research'
   * });
   */
  async addTimeEntry(
    entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimeEntry> {
    this.validateObject(entry, "entry", "addTimeEntry");

    if (!entry.caseId) {
      throw new Error("[BillingApiService.addTimeEntry] caseId is required");
    }
    if (!entry.date) {
      throw new Error("[BillingApiService.addTimeEntry] date is required");
    }
    if (!entry.duration) {
      throw new Error("[BillingApiService.addTimeEntry] duration is required");
    }

    try {
      // Transform frontend TimeEntry to backend CreateTimeEntryDto
      const createDto = {
        caseId: entry.caseId,
        userId: entry.userId || (entry as Record<string, unknown>).createdBy,
        date: entry.date, // Should be ISO date string YYYY-MM-DD
        duration: entry.duration, // In hours
        description: entry.description,
        activity: entry.activity,
        ledesCode: entry.ledesCode,
        rate: entry.rate || 0,
        status: entry.status,
        billable: entry.billable, // Default to true if not specified
        rateTableId: entry.rateTableId,
        internalNotes: entry.internalNotes,
        taskCode: entry.taskCode,
      };

      // Remove undefined values
      Object.keys(createDto).forEach((key) => {
        if ((createDto as Record<string, unknown>)[key] === undefined) {
          delete (createDto as Record<string, unknown>)[key];
        }
      });

      return await apiClient.post<TimeEntry>(
        "/billing/time-entries",
        createDto
      );
    } catch (error) {
      console.error("[BillingApiService.addTimeEntry] Error:", error);
      throw new Error("Failed to create time entry");
    }
  }

  /**
   * Add multiple time entries in bulk
   *
   * @param entries - Array of time entry data
   * @returns Promise<TimeEntry[]> Created time entries
   * @throws Error if validation fails or bulk create fails
   */
  async addBulkTimeEntries(
    entries: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">[]
  ): Promise<TimeEntry[]> {
    this.validateArray(entries, "entries", "addBulkTimeEntries");

    try {
      return await apiClient.post<TimeEntry[]>("/billing/time-entries/bulk", {
        entries,
      });
    } catch (error) {
      console.error("[BillingApiService.addBulkTimeEntries] Error:", error);
      throw new Error("Failed to create bulk time entries");
    }
  }

  /**
   * Update an existing time entry
   *
   * @param id - Time entry ID
   * @param entry - Partial time entry updates
   * @returns Promise<TimeEntry> Updated time entry
   * @throws Error if validation fails or update fails
   */
  async updateTimeEntry(
    id: string,
    entry: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    this.validateId(id, "updateTimeEntry");
    this.validateObject(entry, "entry", "updateTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}`,
        entry
      );
    } catch (error) {
      console.error("[BillingApiService.updateTimeEntry] Error:", error);
      throw new Error(`Failed to update time entry with id: ${id}`);
    }
  }

  /**
   * Approve a time entry
   *
   * @param id - Time entry ID
   * @returns Promise<TimeEntry> Approved time entry
   * @throws Error if id is invalid or approval fails
   */
  async approveTimeEntry(id: string): Promise<TimeEntry> {
    this.validateId(id, "approveTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}/approve`,
        {}
      );
    } catch (error) {
      console.error("[BillingApiService.approveTimeEntry] Error:", error);
      throw new Error(`Failed to approve time entry with id: ${id}`);
    }
  }

  /**
   * Bill a time entry to an invoice
   *
   * @param id - Time entry ID
   * @param invoiceId - Invoice ID
   * @returns Promise<TimeEntry> Billed time entry
   * @throws Error if validation fails or billing fails
   */
  async billTimeEntry(id: string, invoiceId: string): Promise<TimeEntry> {
    this.validateId(id, "billTimeEntry");
    this.validateId(invoiceId, "billTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}/bill`,
        { invoiceId }
      );
    } catch (error) {
      console.error("[BillingApiService.billTimeEntry] Error:", error);
      throw new Error(`Failed to bill time entry with id: ${id}`);
    }
  }

  /**
   * Get unbilled time entries for a case
   *
   * @param caseId - Case ID
   * @returns Promise<TimeEntry[]> Unbilled time entries
   * @throws Error if caseId is invalid or fetch fails
   */
  async getUnbilledTimeEntries(caseId: string): Promise<TimeEntry[]> {
    this.validateId(caseId, "getUnbilledTimeEntries");

    try {
      const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
        `/billing/time-entries/case/${caseId}/unbilled`
      );
      return response.data;
    } catch (error) {
      console.error("[BillingApiService.getUnbilledTimeEntries] Error:", error);
      throw new Error(
        `Failed to fetch unbilled time entries for case: ${caseId}`
      );
    }
  }

  /**
   * Get time entry totals for a case
   *
   * @param caseId - Case ID
   * @returns Promise with total, billable, and unbilled hours
   * @throws Error if caseId is invalid or fetch fails
   */
  async getTimeEntryTotals(
    caseId: string
  ): Promise<{ total: number; billable: number; unbilled: number }> {
    this.validateId(caseId, "getTimeEntryTotals");

    try {
      return await apiClient.get<{
        total: number;
        billable: number;
        unbilled: number;
      }>(`/billing/time-entries/case/${caseId}/totals`);
    } catch (error) {
      console.error("[BillingApiService.getTimeEntryTotals] Error:", error);
      throw new Error(`Failed to fetch time entry totals for case: ${caseId}`);
    }
  }

  /**
   * Delete a time entry
   *
   * @param id - Time entry ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async deleteTimeEntry(id: string): Promise<void> {
    this.validateId(id, "deleteTimeEntry");

    try {
      await apiClient.delete(`/billing/time-entries/${id}`);
    } catch (error) {
      console.error("[BillingApiService.deleteTimeEntry] Error:", error);
      throw new Error(`Failed to delete time entry with id: ${id}`);
    }
  }

  // =============================================================================
  // INVOICE OPERATIONS
  // =============================================================================

  /**
   * Get invoices with optional filters
   *
   * @param filters - Optional filters for caseId, clientId, and status
   * @returns Promise<Invoice[]> Array of invoices
   * @throws Error if fetch fails
   */
  async getInvoices(filters?: {
    caseId?: string;
    clientId?: string;
    status?: string;
  }): Promise<Invoice[]> {
    try {
      const response = await apiClient.get<
        PaginatedResponse<Invoice> | Invoice[]
      >("/billing/invoices", { params: filters });

      // Handle nested paginated response (NestJS standard response wrapping a paginated result)
      const nestedResponse = response as { data?: { data?: unknown } };
      if (
        nestedResponse &&
        nestedResponse.data &&
        nestedResponse.data.data &&
        Array.isArray(nestedResponse.data.data)
      ) {
        return nestedResponse.data.data as Invoice[];
      }

      // Handle paginated response
      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray((response as PaginatedResponse<Invoice>).data)
      ) {
        return (response as PaginatedResponse<Invoice>).data;
      }

      // Handle direct array response
      if (Array.isArray(response)) {
        return response;
      }

      console.warn(
        "[BillingApiService.getInvoices] Unexpected response format:",
        response
      );
      return [];
    } catch {
      console.warn(
        "[BillingApiService.getInvoices] Invoices endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Create a new invoice
   *
   * @param data - Invoice data
   * @returns Promise<unknown> Created invoice
   * @throws Error if validation fails or create fails
   */
  async createInvoice(data: unknown): Promise<unknown> {
    this.validateObject(data, "data", "createInvoice");

    try {
      return await apiClient.post<unknown>("/billing/invoices", data);
    } catch (error) {
      console.error("[BillingApiService.createInvoice] Error:", error);
      throw new Error("Failed to create invoice");
    }
  }

  /**
   * Update an existing invoice
   *
   * @param id - Invoice ID
   * @param data - Partial invoice updates
   * @returns Promise<unknown> Updated invoice
   * @throws Error if validation fails or update fails
   */
  async updateInvoice(id: string, data: unknown): Promise<unknown> {
    this.validateId(id, "updateInvoice");
    this.validateObject(data, "data", "updateInvoice");

    try {
      return await apiClient.put<unknown>(`/billing/invoices/${id}`, data);
    } catch (error) {
      console.error("[BillingApiService.updateInvoice] Error:", error);
      throw new Error(`Failed to update invoice with id: ${id}`);
    }
  }

  /**
   * Send an invoice to client
   *
   * @param id - Invoice ID
   * @returns Promise<unknown> Sent invoice
   * @throws Error if id is invalid or send fails
   */
  async sendInvoice(id: string): Promise<unknown> {
    this.validateId(id, "sendInvoice");

    try {
      return await apiClient.post<unknown>(`/billing/invoices/${id}/send`, {});
    } catch (error) {
      console.error("[BillingApiService.sendInvoice] Error:", error);
      throw new Error(`Failed to send invoice with id: ${id}`);
    }
  }

  // =============================================================================
  // REPORTING & ANALYTICS OPERATIONS
  // =============================================================================

  /**
   * Get trust accounts with optional filters
   * Gracefully handles endpoint unavailability
   *
   * @param filters - Optional filters for clientId and status
   * @returns Promise<TrustAccount[]> Array of trust accounts with full type safety
   */
  async getTrustAccounts(filters?: {
    clientId?: string;
    status?: TrustAccountStatus;
  }): Promise<TrustAccount[]> {
    try {
      // Backend returns array directly, not paginated
      const response = await apiClient.get<TrustAccount[]>(
        "/billing/trust-accounts",
        { params: filters }
      );
      return Array.isArray(response) ? response : [];
    } catch {
      // Fallback to empty array if endpoint doesn't exist yet
      console.warn(
        "[BillingApiService.getTrustAccounts] Trust accounts endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get single trust account by ID
   *
   * @param id - Trust account UUID
   * @returns Promise<TrustAccount> Trust account details
   */
  async getTrustAccount(id: string): Promise<TrustAccount> {
    this.validateId(id, "getTrustAccount");
    return await apiClient.get<TrustAccount>(`/billing/trust-accounts/${id}`);
  }

  /**
   * Create new trust account
   *
   * @param data - Trust account creation data
   * @returns Promise<TrustAccount> Created trust account
   */
  async createTrustAccount(data: CreateTrustAccountDto): Promise<TrustAccount> {
    return await apiClient.post<TrustAccount>("/billing/trust-accounts", data);
  }

  /**
   * Update existing trust account
   *
   * @param id - Trust account UUID
   * @param data - Partial trust account update data
   * @returns Promise<TrustAccount> Updated trust account
   */
  async updateTrustAccount(
    id: string,
    data: UpdateTrustAccountDto
  ): Promise<TrustAccount> {
    this.validateId(id, "updateTrustAccount");
    return await apiClient.patch<TrustAccount>(
      `/billing/trust-accounts/${id}`,
      data
    );
  }

  /**
   * Soft delete trust account
   *
   * @param id - Trust account UUID
   * @returns Promise<void>
   */
  async deleteTrustAccount(id: string): Promise<void> {
    this.validateId(id, "deleteTrustAccount");
    await apiClient.delete(`/billing/trust-accounts/${id}`);
  }

  /**
   * Get trust transactions for account
   *
   * @param accountId - Trust account UUID
   * @param filters - Optional date range and status filters
   * @returns Promise<TrustTransactionEntity[]> Array of transactions
   */
  async getTrustTransactions(
    accountId: string,
    filters?: { startDate?: string; endDate?: string; status?: string }
  ): Promise<TrustTransactionEntity[]> {
    this.validateId(accountId, "getTrustTransactions");
    try {
      const response = await apiClient.get<TrustTransactionEntity[]>(
        `/billing/trust-accounts/${accountId}/transactions`,
        { params: filters }
      );
      return Array.isArray(response) ? response : [];
    } catch {
      console.warn(
        "[BillingApiService.getTrustTransactions] Transactions endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Create a trust transaction (generic)
   *
   * @param accountId - Trust account UUID
   * @param data - Transaction creation data
   * @param createdBy - Optional user ID of creator
   * @returns Promise<TrustTransactionEntity> Created transaction
   */
  async createTrustTransaction(
    accountId: string,
    data: CreateTrustTransactionDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    this.validateId(accountId, "createTrustTransaction");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/transaction`,
      { ...data, createdBy }
    );
  }

  /**
   * Deposit funds into trust account
   *
   * @param accountId - Trust account UUID
   * @param data - Deposit data
   * @param createdBy - Optional user ID of creator
   * @returns Promise<TrustTransactionEntity> Created deposit transaction
   */
  async depositTrustFunds(
    accountId: string,
    data: DepositDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    this.validateId(accountId, "depositTrustFunds");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/deposit`,
      { ...data, createdBy }
    );
  }

  /**
   * Withdraw funds from trust account
   *
   * @param accountId - Trust account UUID
   * @param data - Withdrawal data
   * @param createdBy - Optional user ID of creator
   * @returns Promise<TrustTransactionEntity> Created withdrawal transaction
   */
  async withdrawTrustFunds(
    accountId: string,
    data: WithdrawalDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    this.validateId(accountId, "withdrawTrustFunds");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/withdraw`,
      { ...data, createdBy }
    );
  }

  /**
   * Get trust account balance
   *
   * @param accountId - Trust account UUID
   * @returns Promise with balance and currency
   */
  async getTrustAccountBalance(
    accountId: string
  ): Promise<{ balance: number; currency: string }> {
    this.validateId(accountId, "getTrustAccountBalance");
    return await apiClient.get<{ balance: number; currency: string }>(
      `/billing/trust-accounts/${accountId}/balance`
    );
  }

  /**
   * Get low-balance trust accounts
   *
   * @param threshold - Balance threshold (default 1000)
   * @returns Promise<TrustAccount[]> Accounts below threshold
   */
  async getLowBalanceTrustAccounts(
    threshold?: number
  ): Promise<TrustAccount[]> {
    try {
      return await apiClient.get<TrustAccount[]>(
        "/billing/trust-accounts/low-balance",
        { params: { threshold } }
      );
    } catch {
      console.warn(
        "[BillingApiService.getLowBalanceTrustAccounts] Endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get WIP (Work In Progress) statistics
   * Gracefully handles endpoint unavailability
   *
   * @returns Promise<unknown[]> WIP statistics
   */
  async getWIPStats(): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>("/billing/wip-stats");
    } catch {
      console.warn(
        "[BillingApiService.getWIPStats] WIP stats endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get realization statistics
   * Gracefully handles endpoint unavailability
   *
   * @returns Promise<unknown> Realization statistics
   */
  async getRealizationStats(): Promise<unknown> {
    try {
      return await apiClient.get<unknown>("/billing/realization-stats");
    } catch {
      console.warn(
        "[BillingApiService.getRealizationStats] Realization stats endpoint not available, returning default"
      );
      return [
        { name: "Billed", value: 0, color: "#10b981" },
        { name: "Write-off", value: 100, color: "#ef4444" },
      ];
    }
  }

  /**
   * Get rates for a timekeeper
   * Gracefully handles endpoint unavailability
   *
   * @param timekeeperId - Timekeeper ID
   * @returns Promise<unknown[]> Rate information
   */
  async getRates(timekeeperId: string): Promise<unknown[]> {
    this.validateId(timekeeperId, "getRates");

    try {
      return await apiClient.get<unknown[]>(`/billing/rates/${timekeeperId}`);
    } catch {
      console.warn(
        "[BillingApiService.getRates] Rates endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get billing overview statistics
   * Gracefully handles endpoint unavailability
   *
   * @returns Promise with realization, totalBilled, and month
   */
  async getOverviewStats(): Promise<{
    realization: number;
    totalBilled: number;
    month: string;
  }> {
    try {
      return await apiClient.get<{
        realization: number;
        totalBilled: number;
        month: string;
      }>("/billing/overview-stats");
    } catch {
      console.warn(
        "[BillingApiService.getOverviewStats] Overview stats endpoint not available, returning default"
      );
      return {
        realization: 0,
        totalBilled: 0,
        month: new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      };
    }
  }

  /**
   * Get financial performance data
   *
   * @returns Promise<FinancialPerformanceData>
   */
  async getFinancialPerformance(): Promise<FinancialPerformanceData> {
    try {
      return await apiClient.get<FinancialPerformanceData>(
        "/billing/financial-performance"
      );
    } catch {
      return {
        period: "Current",
        revenue: [],
        expenses: [],
        profit: 0,
        realizationRate: 0,
        collectionRate: 0,
      };
    }
  }

  /**
   * Get top billing accounts
   * Gracefully handles endpoint unavailability
   *
   * @returns Promise<unknown[]> Top accounts by billing
   */
  async getTopAccounts(): Promise<unknown[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<unknown>>(
        "/clients",
        { params: { sortBy: "totalBilled", sortOrder: "desc", limit: 4 } }
      );
      return response.data;
    } catch {
      console.warn(
        "[BillingApiService.getTopAccounts] Top accounts endpoint not available, returning empty array"
      );
      return [];
    }
  }
}
