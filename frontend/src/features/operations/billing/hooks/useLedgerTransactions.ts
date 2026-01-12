import { useCallback } from 'react';
import { DataService } from '@/services/data/dataService';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers';
import { TransactionData } from '../components/TransactionForm';

export function useLedgerTransactions() {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const { closeWindow } = useWindow();

  const addTransaction = useCallback(async (data: TransactionData, windowId?: string) => {
    try {
      await DataService.transactions.add(data);
      notifySuccess(`Transaction logged successfully${data.receiptFile ? ' with receipt' : ''}`);
      if (windowId) {
        closeWindow(windowId);
      }
      return true;
    } catch (err) {
      notifyError('Failed to log transaction');
      console.error('Transaction error:', err);
      return false;
    }
  }, [notifySuccess, notifyError, closeWindow]);

  return {
    addTransaction
  };
}
