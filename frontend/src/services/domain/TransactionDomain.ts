/**
 * TransactionDomain - Financial transaction management service
 * Provides transaction tracking, balance calculation, and reconciliation
 * ? Migrated to backend API (2025-12-21)
 */

import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";

export interface Transaction {
  id: string;
  type: "invoice" | "payment" | "expense" | "refund" | "adjustment";
  amount: number;
  currency: string;
  description: string;
  date: string;
  caseId?: string;
  matterId?: string;
  status: "pending" | "completed" | "reconciled" | "failed";
  paymentMethod?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  userId?: string;
}

interface Balance {
  total: number;
  pending: number;
  reconciled: number;
  currency: string;
}

// Temporary user ID helper until AuthContext is fully linked here
const getCurrentUserId = () => "user-current";

export const TransactionService = {
  getAll: async () => {
    try {
      return await apiClient.get<Transaction[]>("/billing/transactions");
    } catch (error) {
      console.error("[TransactionService.getAll] Error:", error);
      return [];
    }
  },
  getById: async (id: string) => {
    try {
      return await apiClient.get<Transaction>(`/billing/transactions/${id}`);
    } catch (error) {
      console.error("[TransactionService.getById] Error:", error);
      return undefined;
    }
  },

  /**
   * Add a new financial transaction with strict validation
   * Implements "Critical Issue #1: TransactionDomain Missing Financial Controls"
   */
  add: async (item: unknown): Promise<Transaction> => {
    const transaction = (
      item && typeof item === "object" ? item : {}
    ) as Partial<Transaction>;

    // 1. Amount Validation
    if (!transaction.amount || transaction.amount <= 0) {
      throw new ValidationError("Transaction amount must be positive");
    }
    // 2. Max Amount Safety Cap
    if (transaction.amount > 10_000_000) {
      throw new ValidationError(
        "Transaction amount exceeds maximum limit (10M)"
      );
    }
    // 3. Currency Validation
    const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP", "CAD"];
    const currency = transaction.currency || "USD";
    if (!ALLOWED_CURRENCIES.includes(currency)) {
      throw new ValidationError(`Invalid currency code: ${currency}`);
    }
    // 4. Association Validation
    if (!transaction.caseId && !transaction.matterId) {
      throw new ValidationError(
        "Transaction must be associated with case or matter"
      );
    }

    try {
      return await apiClient.post<Transaction>("/billing/transactions", {
        ...transaction,
        currency,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId(),
      });
    } catch (error) {
      console.error("[TransactionService.add] Error:", error);
      throw new OperationError("Failed to create transaction via backend");
    }
  },

  update: async (id: string, updates: unknown) => {
    try {
      return await apiClient.patch<Transaction>(
        `/billing/transactions/${id}`,
        updates
      );
    } catch (error) {
      console.error("[TransactionService.update] Error:", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      return await apiClient.delete(`/billing/transactions/${id}`);
    } catch (error) {
      console.error("[TransactionService.delete] Error:", error);
      throw error;
    }
  },

  // Transaction specific methods
  getTransactions: async (filters?: {
    type?: string;
    status?: string;
    caseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    try {
      return apiClient.get<Transaction[]>("/billing/transactions", { params: filters });
    } catch (error) {
      console.error("[TransactionService.getTransactions] Error:", error);
      return [];
    }
  },

  createTransaction: async (
    transaction: Partial<Transaction>
  ): Promise<Transaction> => {
    // VALIDATION
    if (!transaction.amount || transaction.amount <= 0) {
      throw new Error("ValidationError: Transaction amount must be positive");
    }
    if (transaction.amount > 10_000_000) {
      throw new Error(
        "ValidationError: Transaction amount exceeds maximum limit"
      );
    }
    if (!["USD", "EUR", "GBP", "CAD"].includes(transaction.currency || "USD")) {
      throw new Error("ValidationError: Invalid currency code");
    }
    if (!transaction.caseId && !transaction.matterId) {
      throw new Error(
        "ValidationError: Transaction must be associated with case or matter"
      );
    }

    try {
      return await apiClient.post<Transaction>("/billing/transactions", {
        ...transaction,
        timestamp: new Date().toISOString(),
        // In a real app we would derive userId from context or auth token
        // userId: getCurrentUserId(),
      });
    } catch (error) {
      console.error("[TransactionService.createTransaction] Error:", error);
      throw new Error("OperationError: Failed to create transaction");
    }
  },

  getBalance: async (): Promise<Balance> => {
    try {
      return await apiClient.get<Balance>("/billing/balance");
    } catch (error) {
      console.error("[TransactionService.getBalance] Error:", error);
      return {
        total: 0,
        pending: 0,
        reconciled: 0,
        currency: "USD",
      };
    }
  },

  reconcile: async (transactionId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/billing/transactions/${transactionId}/reconcile`);
      return true;
    } catch (error) {
      console.error("[TransactionService.reconcile] Error:", error);
      return false;
    }
  },
};
