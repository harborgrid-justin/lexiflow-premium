/**
 * @module components/practice/FirmOperations
 * @category Practice Management
 * @description Centralized firm operations with HR, finance, and marketing.
 *
 * THEME SYSTEM USAGE:
 * Theme applied through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BookOpen, Building2, Laptop, MapPin, ShieldAlert, ShoppingCart, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import React, { lazy, Suspense } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Components
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';

// Sub-components
const HRManager = lazy(() => import('./hr/HRManager').then(m => ({ default: m.HRManager })));
const FinancialCenter = lazy(() => import('./FinancialCenter').then(m => ({ default: m.FinancialCenter })));
const MarketingDashboard = lazy(() => import('./MarketingDashboard').then(m => ({ default: m.MarketingDashboard })));
const AssetManager = lazy(() => import('./AssetManager').then(m => ({ default: m.AssetManager })));

// New Enterprise Modules
const KnowledgeCenter = lazy(() => import('./KnowledgeCenter').then(m => ({ default: m.KnowledgeCenter })));
const VendorProcurement = lazy(() => import('./VendorProcurement').then(m => ({ default: m.VendorProcurement })));
const FacilitiesManager = lazy(() => import('./FacilitiesManager').then(m => ({ default: m.FacilitiesManager })));
const SecurityOps = lazy(() => import('./SecurityOps').then(m => ({ default: m.SecurityOps })));
const StrategyBoard = lazy(() => import('./StrategyBoard').then(m => ({ default: m.StrategyBoard })));

type OperationView = 'hr' | 'assets' | 'finance' | 'marketing' | 'knowledge' | 'procurement' | 'facilities' | 'security' | 'strategy';

interface FirmOperationsProps {
  initialTab?: OperationView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'admin', label: 'Administration', icon: Building2,
    subTabs: [
      { id: 'hr', label: 'HR & Staffing', icon: Users },
      { id: 'facilities', label: 'Facilities', icon: MapPin },
      { id: 'assets', label: 'IT & Assets', icon: Laptop },
    ]
  },
  {
    id: 'performance', label: 'Performance', icon: TrendingUp,
    subTabs: [
      { id: 'finance', label: 'Banking & Ledger', icon: Wallet },
      { id: 'marketing', label: 'Marketing & ROI', icon: TrendingUp },
      { id: 'strategy', label: 'Strategic Planning', icon: Target },
    ]
  },
  {
    id: 'governance', label: 'Governance', icon: ShieldAlert,
    subTabs: [
      { id: 'security', label: 'Security Ops', icon: ShieldAlert },
      { id: 'procurement', label: 'Vendor & Contracts', icon: ShoppingCart },
      { id: 'knowledge', label: 'Knowledge Mgmt', icon: BookOpen },
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
      case 'knowledge': return <KnowledgeCenter />;
      case 'procurement': return <VendorProcurement />;
      case 'facilities': return <FacilitiesManager />;
      case 'security': return <SecurityOps />;
      case 'strategy': return <StrategyBoard />;
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

export default FirmOperations;
