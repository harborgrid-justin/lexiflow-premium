/**
 * Trust Accounts API Service
 * Complete type-safe implementation for IOLTA and trust account management
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Full type safety with backend entity alignment
 * - No 'any' types - explicit typing throughout
 * - Compliance-aware method signatures
 * - RESTful endpoint mapping
 */

import { apiClient } from '@/services/infrastructure/apiClient';

import type {
  TrustAccount,
  TrustTransactionEntity,
  CreateTrustAccountDto,
  UpdateTrustAccountDto,
  DepositDto,
  WithdrawalDto,
  ThreeWayReconciliationDto,
  TrustAccountFilters,
  TrustAccountComplianceReport,
  ClientTrustLedgerStatement,
} from '@/types/trust-accounts';

/**
 * Trust Accounts API Service Class
 * Maps to backend /billing/trust-accounts endpoints
 */
export class TrustAccountsApiService {
  private readonly baseUrl = '/billing/trust-accounts';

  /**
   * Get all trust accounts with optional filters
   * @param filters - Optional filtering criteria
   * @returns Array of trust accounts
   */
  async getAll(filters?: TrustAccountFilters): Promise<TrustAccount[]> {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.accountType) params.append('accountType', filters.accountType);
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<TrustAccount[]>(url);
  }

  /**
   * Get single trust account by ID
   * @param id - Account UUID
   * @returns Trust account details
   */
  async getById(id: string): Promise<TrustAccount> {
    return apiClient.get<TrustAccount>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new trust account with compliance validation
   * @param data - Account creation data
   * @returns Created trust account
   */
  async create(data: CreateTrustAccountDto): Promise<TrustAccount> {
    return apiClient.post<TrustAccount>(this.baseUrl, data);
  }

  /**
   * Update existing trust account
   * @param id - Account UUID
   * @param data - Update data
   * @returns Updated trust account
   */
  async update(id: string, data: UpdateTrustAccountDto): Promise<TrustAccount> {
    return apiClient.put<TrustAccount>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Get all transactions for a trust account
   * @param accountId - Account UUID
   * @param filters - Optional date range filters
   * @returns Array of transactions
   */
  async getTransactions(
    accountId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<TrustTransactionEntity[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/${accountId}/transactions?${queryString}`
      : `${this.baseUrl}/${accountId}/transactions`;
    return apiClient.get<TrustTransactionEntity[]>(url);
  }

  /**
   * Deposit funds into trust account
   * Validates prompt deposit compliance (24-48 hour rule)
   * @param accountId - Account UUID
   * @param data - Deposit details
   * @returns Created transaction
   */
  async deposit(accountId: string, data: DepositDto): Promise<TrustTransactionEntity> {
    return apiClient.post<TrustTransactionEntity>(
      `${this.baseUrl}/${accountId}/deposit`,
      data
    );
  }

  /**
   * Withdraw funds from trust account
   * Enforces cash prohibition and zero balance principle
   * @param accountId - Account UUID
   * @param data - Withdrawal details
   * @returns Created transaction
   */
  async withdraw(accountId: string, data: WithdrawalDto): Promise<TrustTransactionEntity> {
    return apiClient.post<TrustTransactionEntity>(
      `${this.baseUrl}/${accountId}/withdraw`,
      data
    );
  }

  /**
   * Perform three-way reconciliation
   * Matches bank statement + main ledger + client ledgers
   * @param accountId - Account UUID
   * @param data - Reconciliation data
   */
  async reconcile(accountId: string, data: ThreeWayReconciliationDto): Promise<void> {
    return apiClient.post<void>(
      `${this.baseUrl}/${accountId}/reconcile`,
      data
    );
  }

  /**
   * Get compliance report for account
   * @param accountId - Account UUID
   * @param periodStart - Report period start date (ISO 8601)
   * @param periodEnd - Report period end date (ISO 8601)
   * @returns Comprehensive compliance report
   */
  async getComplianceReport(
    accountId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<TrustAccountComplianceReport> {
    return apiClient.get<TrustAccountComplianceReport>(
      `${this.baseUrl}/${accountId}/compliance-report?start=${periodStart}&end=${periodEnd}`
    );
  }

  /**
   * Get client trust ledger statement
   * Individual client ledger showing all transactions
   * @param accountId - Account UUID
   * @param clientId - Client UUID
   * @param periodStart - Statement period start (ISO 8601)
   * @param periodEnd - Statement period end (ISO 8601)
   * @returns Client-specific ledger statement
   */
  async getClientLedger(
    accountId: string,
    clientId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<ClientTrustLedgerStatement> {
    return apiClient.get<ClientTrustLedgerStatement>(
      `${this.baseUrl}/${accountId}/client-ledger/${clientId}?start=${periodStart}&end=${periodEnd}`
    );
  }

  /**
   * Delete trust account (soft delete)
   * @param id - Account UUID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

// Export singleton instance
export const trustAccountsApi = new TrustAccountsApiService();
