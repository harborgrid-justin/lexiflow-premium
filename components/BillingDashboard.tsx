import React, { Suspense, lazy, useState } from 'react';
import { 
  DollarSign, FileText, PieChart, Activity, Calculator, CreditCard, Landmark, RefreshCw 
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

// Sub-components
const BillingOverview = lazy(() => import('./billing/BillingOverview').then(m => ({ default: m.BillingOverview })));
const BillingInvoices = lazy(() => import('./billing/BillingInvoices').then(m => ({ default: m.BillingInvoices })));
const BillingWIP = lazy(() => import('./billing/BillingWIP').then(m => ({ default: m.BillingWIP })));
const BillingLedger = lazy(() => import('./billing/BillingLedger').then(m => ({ default: m.BillingLedger })));

type BillingView = 'overview' | 'invoices' | 'wip' | 'expenses' | 'trust' | 'analytics';

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'revenue', label: 'Revenue Cycle', icon: DollarSign,
    subTabs: [
      { id: 'overview', label: 'Dashboard', icon: Activity },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'wip', label: 'WIP & Time', icon: Calculator },
    ]
  },
  {
    id: 'accounting', label: 'Accounting', icon: Landmark,
    subTabs: [
      { id: 'expenses', label: 'General Ledger', icon: CreditCard },
      { id: 'trust', label: 'Trust (IOLTA)', icon: Landmark },
    ]
  },
  {
    id: 'reporting', label: 'Reporting', icon: PieChart,
    subTabs: [
      { id: 'analytics', label: 'Analytics', icon: PieChart },
    ]
  }
];

interface BillingDashboardProps {
  navigateTo?: (view: string) => void;
  initialTab?: BillingView;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ navigateTo, initialTab }) => {
  const notify = useNotify();
  const [activeTab, setActiveTab] = useSessionStorage<string>('billing_active_tab', initialTab || 'overview');
  const [period, setPeriod] = useState('30d');

  const { mutate: syncFinancials, isLoading: isSyncing } = useMutation(
      DataService.billing.sync,
      { onSuccess: () => notify.success("Financial data synced.") }
  );

  const { mutate: exportReport } = useMutation(
      (format: string) => DataService.billing.export(format),
      { onSuccess: (_, format) => notify.success(`Report exported (${format.toUpperCase()}).`) }
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <BillingOverview onNavigate={navigateTo} />;
      case 'invoices': return <BillingInvoices />;
      case 'wip': return <BillingWIP />;
      case 'expenses': return <BillingLedger />;
      case 'trust': return <BillingLedger />; 
      case 'analytics': return <div className="p-12 text-center italic text-slate-500">Analytics module loading...</div>;
      default: return <BillingOverview />;
    }
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
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Billing Module..." />}>
        {renderContent()}
      </Suspense>
    </TabbedPageLayout>
  );
};

export default BillingDashboard;
