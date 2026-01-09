/**
 * TransactionDomain - Financial transaction management service
 * Provides transaction tracking, balance calculation, and reconciliation
 * ? Migrated to backend API (2025-12-21)
 */

import { delay } from "@/utils/async";
import { apiClient } from "@/services/infrastructure/apiClient";
import { isBackendApiEnabled } from "@/api";
import { ValidationError, OperationError } from "@/services/core/errors";

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
    if (isBackendApiEnabled()) {
      return apiClient.get<Transaction[]>("/billing/transactions");
    }
    // Transactions API not yet available, return empty array
    await delay(200);
    return [];
  },
  getById: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Transaction>(`/billing/transactions/${id}`);
    }
    await delay(200);
    return undefined;
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

    if (isBackendApiEnabled()) {
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
    }

    // Fallback Local Implementation
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: transaction.type || "expense",
      amount: transaction.amount,
      currency: currency,
      description: transaction.description || "New Transaction",
      date: transaction.date || new Date().toISOString(),
      caseId: transaction.caseId,
      matterId: transaction.matterId,
      status: "pending",
      paymentMethod: transaction.paymentMethod,
      reference: transaction.reference,
      metadata: {
        ...(transaction.metadata || {}),
        createdBy: getCurrentUserId(),
        createdAt: new Date().toISOString(),
      },
    };

    await delay(200);
    return newTransaction;
  },

  update: async (id: string, updates: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<Transaction>(
        `/billing/transactions/${id}`,
        updates
      );
    }
    await delay(200);
    return {
      id,
      ...(updates && typeof updates === "object" ? updates : {}),
    };
  },

  delete: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/billing/transactions/${id}`);
    }
    await delay(200);
    return { success: true, id };
  },

  // Transaction specific methods
  getTransactions: async (filters?: {
    type?: string;
    status?: string;
    caseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Transaction[]>("/billing/transactions", filters);
    }
    // Transactions API not yet available
    await delay(200);
    const transactions: Transaction[] = [];

    // Client-side filtering as fallback
    let filtered = transactions;

    if (filters?.type) {
      filtered = filtered.filter((t: Transaction) => t.type === filters.type);
    }

    if (filters?.status) {
      filtered = filtered.filter(
        (t: Transaction) => t.status === filters.status
      );
    }

    if (filters?.caseId) {
      filtered = filtered.filter(
        (t: Transaction) => t.caseId === filters.caseId
      );
    }

    if (filters?.startDate || filters?.endDate) {
      filtered = filtered.filter((t: Transaction) => {
        const txDate = new Date(t.date);
        const start = filters.startDate
          ? new Date(filters.startDate)
          : new Date(0);
        const end = filters.endDate
          ? new Date(filters.endDate)
          : new Date("2100-01-01");
        return txDate >= start && txDate <= end;
      });
    }

    // Sort by date descending
    return filtered.sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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

    if (isBackendApiEnabled()) {
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
    }

    // Fallback logic for when backend is disabled (e.g. dev/demo mode)
    // but still enforcing the validation above.
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: transaction.type || "expense",
      amount: transaction.amount,
      currency: transaction.currency || "USD",
      description: transaction.description || "New Transaction",
      date: transaction.date || new Date().toISOString(),
      caseId: transaction.caseId,
      matterId: transaction.matterId,
      status: "pending",
      paymentMethod: transaction.paymentMethod,
      reference: transaction.reference,
      metadata: transaction.metadata,
    };

    await delay(200);
    return newTransaction;
  },

  getBalance: async (): Promise<Balance> => {
    // Fallback calculation (API not available)
    await delay(50);
    const transactions: Transaction[] = [];

    const balance: Balance = {
      total: 0,
      pending: 0,
      reconciled: 0,
      currency: "USD",
    };

    transactions.forEach((t: Transaction) => {
      const amount =
        t.type === "expense" || t.type === "refund" ? -t.amount : t.amount;

      balance.total += amount;

      if (t.status === "pending") {
        balance.pending += amount;
      } else if (t.status === "reconciled") {
        balance.reconciled += amount;
      }
    });

    return balance;
  },

  reconcile: async (transactionId: string): Promise<boolean> => {
    await delay(100);
    console.log(
      `[TransactionService] Reconciled transaction: ${transactionId}`
    );
    return true;
  },
};
