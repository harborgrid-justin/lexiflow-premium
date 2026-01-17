import { useCallback } from "react";

import { useNotify } from "@/hooks/useNotify";
import { useMutation } from "@/hooks/useQueryHooks";
import { useWindow } from "@/providers";
import { DataService } from "@/services/data/data-service.service";

import { type TransactionData } from "../components/TransactionForm";

export type LedgerTransactionStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export interface LedgerTransactionState {
  status: LedgerTransactionStatus;
}

export interface LedgerTransactionActions {
  addTransaction: (
    data: TransactionData,
    windowId?: string,
  ) => Promise<boolean>;
}

export function useLedgerTransactions(): [
  LedgerTransactionState,
  LedgerTransactionActions,
] {
  const notify = useNotify();
  const { closeWindow } = useWindow();

  const { mutate: addTransactionMutation, isLoading } = useMutation(
    async (data: TransactionData) => {
      return await DataService.transactions.add(data);
    },
    {
      onSuccess: (_, variables) => {
        notify.success(
          `Transaction logged successfully${variables.receiptFile ? " with receipt" : ""}`,
        );
      },
      onError: (error) => {
        notify.error("Failed to log transaction");
        console.error("Transaction error:", error);
      },
    },
  );

  const addTransaction = useCallback(
    async (data: TransactionData, windowId?: string) => {
      try {
        await addTransactionMutation(data);
        if (windowId) {
          closeWindow(windowId);
        }
        return true;
      } catch (error) {
        console.error("Failed to add transaction", error);
        return false;
      }
    },
    [addTransactionMutation, closeWindow],
  );

  const status: LedgerTransactionStatus = isLoading ? "submitting" : "idle";

  return [{ status }, { addTransaction }];
}
