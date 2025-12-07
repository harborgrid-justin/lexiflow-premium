
import React, { Suspense, lazy, useState, useTransition } from 'react';
import {
  RefreshCw
} from 'lucide-react';
import { Button } from './common/Button';
import { PeriodSelector } from './common/PeriodSelector';
import { ExportMenu } from './common/ExportMenu';
import { useMutation } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { useNotify } from '../hooks/useNotify';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';
import { cn } from '../utils/cn';
import { BILLING_TAB_CONFIG, BillingView } from '../config/billingDashboardConfig'; // Updated import path
import { BillingDashboardContent } from './billing/BillingDashboardContent'; // Updated import path

// Sub-components (these were moved to BillingDashboardContent)
// const BillingOverview = lazy(() => import('./billing/BillingOverview').then(m => ({ default: m.BillingOverview })));
// const BillingInvoices = lazy(() => import('./billing/BillingInvoices').then(m => ({ default: m.BillingInvoices })));
// const BillingWIP = lazy(() => import('./billing/BillingWIP').then(m => ({ default: m.BillingWIP })));
// const BillingLedger = lazy(() => import('./billing/BillingLedger').then(m => ({ default: m.BillingLedger })));

// BillingView was moved to config/billingDashboardConfig.ts
// type BillingView = 'overview' | 'invoices' | 'wip' | 'expenses' | 'trust' | 'analytics';

// TAB_CONFIG was moved to config/billingDashboardConfig.ts

interface BillingDashboardProps {
  navigateTo?: (view: string) => void;
  initialTab?: BillingView;
}

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