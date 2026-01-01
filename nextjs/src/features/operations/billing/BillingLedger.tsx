import { Button } from '@/components/ui/atoms/Button/Button';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers/WindowContext';
import { DataService } from '@/services/data/dataService';
import { OperatingLedger, TrustLedger } from '@features/knowledge';
import { Plus } from 'lucide-react';
import React, { memo, useCallback, useState } from 'react';
import { LedgerTabs } from './components/LedgerTabs';
import { TransactionForm, TransactionData } from './components/TransactionForm';

const BillingLedgerComponent: React.FC = () => {
  const { openWindow, closeWindow } = useWindow();
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');

  const handleRecordTransaction = useCallback(() => {
    const winId = `txn-new-${crypto.randomUUID()}`.slice(0, 32);

    const handleSubmit = async (data: TransactionData) => {
      try {
        await DataService.transactions.add(data);
        notifySuccess(`Transaction logged successfully${data.receiptFile ? ' with receipt' : ''}`);
        closeWindow(winId);
      } catch (err) {
        notifyError('Failed to log transaction');
        console.error('Transaction error:', err);
      }
    };

    openWindow(
      winId,
      'Record Ledger Transaction',
      <TransactionForm onSubmit={handleSubmit} onError={notifyError} />
    );
  }, [openWindow, closeWindow, notifySuccess, notifyError]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
        <LedgerTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1" />
        <Button variant="outline" size="sm" icon={Plus} onClick={handleRecordTransaction}>
          Log Transaction
        </Button>
      </div>

      {activeTab === 'operating' ? <OperatingLedger /> : <TrustLedger />}
    </div>
  );
};

export const BillingLedger = memo(BillingLedgerComponent);
BillingLedger.displayName = 'BillingLedger';
