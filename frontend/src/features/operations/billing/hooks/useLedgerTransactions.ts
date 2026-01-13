import { useCallback, useState } from "react";
import { DataService } from "@/services/data/dataService";
import { useNotify } from "@/hooks/useNotify";
import { useWindow } from "@/providers";
import { TransactionData } from "../components/TransactionForm";

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
    windowId?: string
  ) => Promise<boolean>;
}

export function useLedgerTransactions(): [
  LedgerTransactionState,
  LedgerTransactionActions,
] {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const { closeWindow } = useWindow();
  const [status, setStatus] = useState<LedgerTransactionStatus>("idle");

  const addTransaction = useCallback(
    async (data: TransactionData, windowId?: string) => {
      setStatus("submitting");
      try {
        await DataService.transactions.add(data);
        notifySuccess(
          `Transaction logged successfully${data.receiptFile ? " with receipt" : ""}`
        );
        if (windowId) {
          closeWindow(windowId);
        }
        setStatus("success");
        return true;
      } catch (err) {
        notifyError("Failed to log transaction");
        console.error("Transaction error:", err);
        setStatus("error");
        return false;
      }
    },
    [notifySuccess, notifyError, closeWindow]
  );

  return [{ status }, { addTransaction }];
}
