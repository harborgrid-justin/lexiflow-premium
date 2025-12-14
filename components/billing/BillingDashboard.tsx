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
import { useMutation } from '../../services/queryClient';
import { DataService } from '../../services/dataService';

// Hooks
import { useNotify } from '../../hooks/useNotify';
import { useSessionStorage } from '../../hooks/useSessionStorage';

// Components
import { Button } from '../common/Button';
import { PeriodSelector } from '../common/PeriodSelector';
import { ExportMenu } from '../common/ExportMenu';
import { TabbedPageLayout, TabConfigItem } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { BillingDashboardContent } from './BillingDashboardContent';

// Utils & Config
import { cn } from '../../utils/cn';
import { BILLING_TAB_CONFIG, BillingView } from '../../config/billingDashboardConfig';

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
export const BillingDashboard: React.FC<BillingDashboardProps> = ({ navigateTo, initialTab }) => {
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('billing_active_tab', initialTab || 'overview');
  const [period, setPeriod] = useState('30d');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  const { mutate: syncFinancials, isLoading: isSyncing } = useMutation(
      DataService.billing.sync,
      { onSuccess: () => notify.success("Financial data synced.") }
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

export default BillingDashboard;
