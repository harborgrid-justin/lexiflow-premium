import { useState, useTransition } from 'react';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { useNotify } from '@/hooks/useNotify';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BillingView } from '@/config/tabs.config';

export const useBillingDashboard = (initialTab: string = 'overview', _navigateTo?: (view: string) => void) => {
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useSessionStorage<string>('billing_active_tab', initialTab);
  const [period, setPeriod] = useState('30d');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+w': () => setActiveTab('wip'),
    'mod+i': () => setActiveTab('invoices'),
    'mod+e': () => setActiveTab('expenses'),
    'mod+l': () => setActiveTab('ledger'),
    'mod+t': () => setActiveTab('trust')
  });

  const { mutate: syncFinancials, isLoading: isSyncing } = useMutation(
    async () => {
      // Retry logic: 3 attempts with exponential backoff
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          return await DataService.billing.sync();
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    },
    {
      onSuccess: () => notify.success("Financial data synced."),
      onError: () => notify.error("Sync failed after 3 attempts. Please try again later.")
    }
  );

  const { mutate: exportReport } = useMutation(
    (format: string) => DataService.billing.export(format),
    { onSuccess: (_result, format) => notify.success(`Report exported (${format.toUpperCase()}).`) }
  );

  return {
    activeTab: activeTab as BillingView,
    setActiveTab,
    period,
    setPeriod,
    syncFinancials,
    isSyncing,
    exportReport,
    isPending
  };
};
