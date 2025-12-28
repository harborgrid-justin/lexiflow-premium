/**
 * @module components/billing/BillingDashboard
 * @category Billing
 * @description Main billing dashboard with tabbed navigation for WIP, invoices, and ledger.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy, useState, useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks
import { useNotify } from '@/hooks/useNotify';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Components
import { Button } from '@/components/atoms/Button';
import { PeriodSelector } from '@/components/molecules/PeriodSelector';
import { ExportMenu } from '@/components/organisms/ExportMenu';
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts/TabbedPageLayout';
import { LazyLoader } from '@/components/molecules/LazyLoader';
import { BillingDashboardContent } from '@features/operations';
import { BillingErrorBoundary } from './BillingErrorBoundary';

// Utils & Config
import { cn } from '@/utils/cn';
import { BILLING_TAB_CONFIG, BillingView } from '@/config/tabs.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BillingDashboardProps {
  /** Optional callback for navigation. */
  navigateTo?: (view: string) => void;
  /** Optional initial tab to display. */
  initialTab?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const BillingDashboardInternal: React.FC<BillingDashboardProps> = ({ navigateTo, initialTab }) => {
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('billing_active_tab', initialTab || 'overview');
  const [period, setPeriod] = useState('30d');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
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
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // 1s, 2s, 4s (max 30s)
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
      { onSuccess: (_, format) => notify.success(`Report exported (${format.toUpperCase()}).`) }
  );

  const renderContent = () => {
    // Delegation to BillingDashboardContent
    return <BillingDashboardContent activeTab={activeTab as BillingView} navigateTo={navigateTo} />;
  };

  return (
    <TabbedPageLayout
      pageTitle="Billing & Finance"
      pageSubtitle="Revenue cycle management, invoicing, and firm accounting."
      pageActions={
        <div className="flex gap-3 items-center">
            <PeriodSelector selected={period} onChange={setPeriod} />
            <ExportMenu onExport={exportReport as any} />
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => syncFinancials(undefined)} isLoading={isSyncing}>Sync</Button>
        </div>
      }
      tabConfig={BILLING_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Billing Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

const BillingDashboard: React.FC<BillingDashboardProps> = (props) => (
  <BillingErrorBoundary>
    <BillingDashboardInternal {...props} />
  </BillingErrorBoundary>
);

export default BillingDashboard;

