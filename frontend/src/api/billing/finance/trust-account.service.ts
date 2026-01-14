/**
 * Trust Account Service
 * Handles all trust account-related API operations
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  CreateTrustAccountDto,
  CreateTrustTransactionDto,
  DepositDto,
  TrustAccount,
  TrustAccountStatus,
  TrustTransactionEntity,
  UpdateTrustAccountDto,
  WithdrawalDto,
} from "./types";
import { validateId } from "./utils";

export class TrustAccountService {
  /**
   * Get trust accounts with optional filters
   */
  async getTrustAccounts(filters?: {
    clientId?: string;
    status?: TrustAccountStatus;
  }): Promise<TrustAccount[]> {
    try {
      const response = await apiClient.get<TrustAccount[]>(
        "/billing/trust-accounts",
        filters
      );
      return Array.isArray(response) ? response : [];
    } catch {
      console.warn(
        "[TrustAccountService.getTrustAccounts] Trust accounts endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get single trust account by ID
   */
  async getTrustAccount(id: string): Promise<TrustAccount> {
    validateId(id, "getTrustAccount");
    return await apiClient.get<TrustAccount>(`/billing/trust-accounts/${id}`);
  }

  /**
   * Create new trust account
   */
  async createTrustAccount(data: CreateTrustAccountDto): Promise<TrustAccount> {
    return await apiClient.post<TrustAccount>("/billing/trust-accounts", data);
  }

  /**
   * Update existing trust account
   */
  async updateTrustAccount(
    id: string,
    data: UpdateTrustAccountDto
  ): Promise<TrustAccount> {
    validateId(id, "updateTrustAccount");
    return await apiClient.patch<TrustAccount>(
      `/billing/trust-accounts/${id}`,
      data
    );
  }

  /**
   * Soft delete trust account
   */
  async deleteTrustAccount(id: string): Promise<void> {
    validateId(id, "deleteTrustAccount");
    await apiClient.delete(`/billing/trust-accounts/${id}`);
  }

  /**
   * Get trust transactions for account
   */
  async getTrustTransactions(
    accountId: string,
    filters?: { startDate?: string; endDate?: string; status?: string }
  ): Promise<TrustTransactionEntity[]> {
    validateId(accountId, "getTrustTransactions");
    try {
      const response = await apiClient.get<TrustTransactionEntity[]>(
        `/billing/trust-accounts/${accountId}/transactions`,
        filters
      );
      return Array.isArray(response) ? response : [];
    } catch {
      console.warn(
        "[TrustAccountService.getTrustTransactions] Transactions endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Create a trust transaction (generic)
   */
  async createTrustTransaction(
    accountId: string,
    data: CreateTrustTransactionDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    validateId(accountId, "createTrustTransaction");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/transaction`,
      { ...data, createdBy }
    );
  }

  /**
   * Deposit funds into trust account
   */
  async depositTrustFunds(
    accountId: string,
    data: DepositDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    validateId(accountId, "depositTrustFunds");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/deposit`,
      { ...data, createdBy }
    );
  }

  /**
   * Withdraw funds from trust account
   */
  async withdrawTrustFunds(
    accountId: string,
    data: WithdrawalDto,
    createdBy?: string
  ): Promise<TrustTransactionEntity> {
    validateId(accountId, "withdrawTrustFunds");
    return await apiClient.post<TrustTransactionEntity>(
      `/billing/trust-accounts/${accountId}/withdraw`,
      { ...data, createdBy }
    );
  }

  /**
   * Get trust account balance
   */
  async getTrustAccountBalance(
    accountId: string
  ): Promise<{ balance: number; currency: string }> {
    validateId(accountId, "getTrustAccountBalance");
    return await apiClient.get<{ balance: number; currency: string }>(
      `/billing/trust-accounts/${accountId}/balance`
    );
  }

  /**
   * Get low-balance trust accounts
   */
  async getLowBalanceTrustAccounts(
    threshold?: number
  ): Promise<TrustAccount[]> {
    try {
      return await apiClient.get<TrustAccount[]>(
        "/billing/trust-accounts/low-balance",
        { threshold }
      );
    } catch {
      console.warn(
        "[TrustAccountService.getLowBalanceTrustAccounts] Endpoint not available, returning empty array"
      );
      return [];
    }
  }
}

export const trustAccountService = new TrustAccountService();
