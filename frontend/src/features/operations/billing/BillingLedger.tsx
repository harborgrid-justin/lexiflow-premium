import { Button } from '@/shared/ui/atoms/Button/Button';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers';
import { OperatingLedger, TrustLedger } from '@features/knowledge';
import { Plus } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { LedgerTabs } from './components/LedgerTabs';
import { TransactionForm, TransactionData } from './components/TransactionForm';
import { useLedgerTransactions } from './hooks/useLedgerTransactions';

const BillingLedgerComponent: React.FC = () => {
  const { openWindow } = useWindow();
  const { error: notifyError } = useNotify();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');
  const { addTransaction } = useLedgerTransactions();

  const handleRecordTransaction = useCallback(() => {
    const winId = `txn-new-${crypto.randomUUID()}`.slice(0, 32);

    const handleSubmit = async (data: TransactionData) => {
        await addTransaction(data, winId);
    };

    openWindow(
      winId,
      'Record Ledger Transaction',
      <TransactionForm onSubmit={handleSubmit} onError={notifyError} />
    );
  }, [openWindow, notifyError, addTransaction]);

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
