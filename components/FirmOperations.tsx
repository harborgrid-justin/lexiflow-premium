import React, { Suspense, lazy } from 'react';
import { Users, TrendingUp, Building2, Briefcase, Laptop, Wallet } from 'lucide-react';
import { Button } from './common/Button';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';

// Sub-components
const HRManager = lazy(() => import('./practice/HRManager').then(m => ({ default: m.HRManager })));
const FinancialCenter = lazy(() => import('./practice/FinancialCenter').then(m => ({ default: m.FinancialCenter })));
const MarketingDashboard = lazy(() => import('./practice/MarketingDashboard').then(m => ({ default: m.MarketingDashboard })));
const AssetManager = lazy(() => import('./practice/AssetManager').then(m => ({ default: m.AssetManager })));

type OperationView = 'hr' | 'assets' | 'finance' | 'marketing';

interface FirmOperationsProps {
    initialTab?: OperationView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'admin', label: 'Administration', icon: Building2,
    subTabs: [
      { id: 'hr', label: 'HR & Staffing', icon: Users },
      { id: 'assets', label: 'IT & Assets', icon: Laptop },
    ]
  },
  {
    id: 'performance', label: 'Firm Performance', icon: TrendingUp,
    subTabs: [
      { id: 'finance', label: 'Banking & Ledger', icon: Wallet },
      { id: 'marketing', label: 'Marketing & ROI', icon: TrendingUp },
    ]
  }
];

export const FirmOperations: React.FC<FirmOperationsProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useSessionStorage<string>('ops_active_tab', initialTab || 'hr');

  const renderContent = () => {
    switch (activeTab) {
      case 'hr': return <HRManager />;
      case 'assets': return <AssetManager />;
      case 'finance': return <FinancialCenter />;
      case 'marketing': return <MarketingDashboard />;
      default: return <HRManager />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Firm Operations"
      pageSubtitle="Centralized management for staff, assets, financials, and growth."
      pageActions={
        <div className="flex gap-2">
          <Button variant="outline">Firm Settings</Button>
          <Button variant="primary">Generate P&L Report</Button>
        </div>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
        <Suspense fallback={<LazyLoader message="Loading Operations Module..." />}>
          {renderContent()}
        </Suspense>
    </TabbedPageLayout>
  );
};
