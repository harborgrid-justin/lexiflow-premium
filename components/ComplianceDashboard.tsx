import React, { Suspense, lazy } from 'react';
import { LayoutDashboard, ShieldAlert, Lock, ScrollText, Download } from 'lucide-react';
import { Button } from './common/Button';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';

// Sub-components
const ComplianceOverview = lazy(() => import('./compliance/ComplianceOverview').then(m => ({ default: m.ComplianceOverview })));
const ComplianceConflicts = lazy(() => import('./compliance/ComplianceConflicts').then(m => ({ default: m.ComplianceConflicts })));
const ComplianceWalls = lazy(() => import('./compliance/ComplianceWalls').then(m => ({ default: m.ComplianceWalls })));
const CompliancePolicies = lazy(() => import('./compliance/CompliancePolicies').then(m => ({ default: m.CompliancePolicies })));

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardProps {
    initialTab?: ComplianceView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'risk_center', label: 'Risk Center', icon: ShieldAlert,
    subTabs: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'policies', label: 'Regulatory Policies', icon: ScrollText },
    ]
  },
  {
    id: 'clearance', label: 'Clearance', icon: ShieldAlert,
    subTabs: [
      { id: 'conflicts', label: 'Conflict Checks', icon: ShieldAlert },
    ]
  },
  {
    id: 'barriers', label: 'Information Barriers', icon: Lock,
    subTabs: [
      { id: 'walls', label: 'Ethical Walls', icon: Lock },
    ]
  }
];

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useSessionStorage<string>('compliance_active_tab', initialTab || 'overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <ComplianceOverview />;
      case 'conflicts': return <ComplianceConflicts conflicts={[]} />;
      case 'walls': return <ComplianceWalls walls={[]} />;
      case 'policies': return <CompliancePolicies />;
      default: return <ComplianceOverview />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Risk & Compliance Center"
      pageSubtitle="Conflicts, Ethical Walls, and Regulatory Monitoring."
      pageActions={<Button variant="secondary" icon={Download}>Audit Report</Button>}
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Compliance Module..." />}>
        {renderContent()}
      </Suspense>
    </TabbedPageLayout>
  );
};

export default ComplianceDashboard;
