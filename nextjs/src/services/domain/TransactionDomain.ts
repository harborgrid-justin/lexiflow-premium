/**
 * TransactionDomain - Financial transaction management service
 * Provides transaction tracking, balance calculation, and reconciliation
 * ? Migrated to backend API (2025-12-21)
 * @enhanced 2026-01-08 - Added validation, compliance checks, backend integration
 */

import { isBackendApiEnabled } from "@/api";
import { OperationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";
import { delay } from "@/utils/async";

interface Transaction {
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
  metadata?: unknown;
}

interface Balance {
  total: number;
  pending: number;
  reconciled: number;
  currency: string;
}

export const TransactionService = {
  getAll: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<Transaction[]>("/transactions");
      } catch (error) {
        console.error("[TransactionService.getAll] Error:", error);
        throw new OperationError("Failed to fetch transactions");
      }
    }
    await delay(200);
    return [];
  },
  getById: async (id: string) => {
    if (!id || id.trim() === "") {
      throw new Error("[TransactionService.getById] Invalid id parameter");
    }

    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<Transaction>(`/transactions/${id}`);
      } catch (error) {
        console.error("[TransactionService.getById] Error:", error);
        return undefined;
      }
    }
    await delay(200);
    return undefined;
  },

  add: async (item: unknown) => {
    const itemObj =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    // Basic validation
    if (
      !itemObj.amount ||
      typeof itemObj.amount !== "number" ||
      itemObj.amount <= 0
    ) {
      throw new Error(
        "[TransactionService.add] Transaction amount must be a positive number"
      );
    }

    if (isBackendApiEnabled()) {
      try {
        return await apiClient.post<Transaction>("/transactions", {
          ...itemObj,
          createdAt: new Date().toISOString(),
          status: itemObj.status || "pending",
        });
      } catch (error) {
        console.error("[TransactionService.add] Error:", error);
        throw new OperationError("Failed to create transaction");
      }
    }

    const transaction = {
      ...itemObj,
      createdAt: new Date().toISOString(),
      status: itemObj.status || "pending",
    };
    await delay(200);
    return transaction;
  },

  update: async (id: string, updates: unknown) => {
    if (!id || id.trim() === "") {
      throw new Error("[TransactionService.update] Invalid id parameter");
    }

    if (isBackendApiEnabled()) {
      try {
        return await apiClient.patch<Transaction>(
          `/transactions/${id}`,
          updates
        );
      } catch (error) {
        console.error("[TransactionService.update] Error:", error);
        throw new OperationError("Failed to update transaction");
      }
    }

    await delay(200);
    return {
      id,
      ...(updates && typeof updates === "object" ? updates : {}),
    };
  },

  delete: async (id: string) => {
    if (!id || id.trim() === "") {
      throw new Error("[TransactionService.delete] Invalid id parameter");
    }

    if (isBackendApiEnabled()) {
      try {
        await apiClient.delete(`/transactions/${id}`);
        return { success: true, id };
      } catch (error) {
        console.error("[TransactionService.delete] Error:", error);
        throw new OperationError("Failed to delete transaction");
      }
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
      try {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.caseId) params.append("caseId", filters.caseId);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);

        return await apiClient.get<Transaction[]>(
          `/transactions?${params.toString()}`
        );
      } catch (error) {
        console.error("[TransactionService.getTransactions] Error:", error);
        return [];
      }
    }

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
      throw new Error(
        "[TransactionService] Transaction amount must be positive"
      );
    }
    if (transaction.amount > 10_000_000) {
      throw new Error(
        "[TransactionService] Transaction amount exceeds maximum limit"
      );
    }
    const validCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
    if (
      transaction.currency &&
      !validCurrencies.includes(transaction.currency)
    ) {
      throw new Error("[TransactionService] Invalid currency code");
    }
    if (!transaction.caseId && !transaction.matterId) {
      throw new Error(
        "[TransactionService] Transaction must be associated with case or matter"
      );
    }
    const validTypes = [
      "invoice",
      "payment",
      "expense",
      "refund",
      "adjustment",
    ];
    if (transaction.type && !validTypes.includes(transaction.type)) {
      throw new Error("[TransactionService] Invalid transaction type");
    }

    // BACKEND API INTEGRATION
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.post<Transaction>("/transactions", {
          ...transaction,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[TransactionService.createTransaction] Error:", error);
        throw new OperationError("Failed to create transaction");
      }
    }

    // Fallback implementation with validation
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<Balance>("/transactions/balance");
      } catch (error) {
        console.error("[TransactionService.getBalance] Error:", error);
        throw new OperationError("Failed to fetch balance");
      }
    }

    // Fallback calculation
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
    if (!transactionId || transactionId.trim() === "") {
      throw new Error(
        "[TransactionService.reconcile] Invalid transactionId parameter"
      );
    }

    if (isBackendApiEnabled()) {
      try {
        await apiClient.post(`/transactions/${transactionId}/reconcile`, {});
        return true;
      } catch (error) {
        console.error("[TransactionService.reconcile] Error:", error);
        throw new OperationError("Failed to reconcile transaction");
      }
    }

    await delay(100);
    console.log(
      `[TransactionService] Reconciled transaction: ${transactionId}`
    );
    return true;
  },
};
