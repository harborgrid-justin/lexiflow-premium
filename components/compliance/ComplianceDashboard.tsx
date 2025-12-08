
import React, { Suspense, lazy, useTransition } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../common/Button';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { cn } from '../../utils/cn';
import { COMPLIANCE_TAB_CONFIG } from '../../config/complianceDashboardConfig';
import { ComplianceDashboardContent } from './ComplianceDashboardContent';

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardProps {
    initialTab?: ComplianceView;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('compliance_active_tab', initialTab || 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  return (
    <TabbedPageLayout
      pageTitle="Risk & Compliance Center"
      pageSubtitle="Conflicts, Ethical Walls, and Regulatory Monitoring."
      pageActions={<Button variant="secondary" icon={Download}>Audit Report</Button>}
      tabConfig={COMPLIANCE_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Compliance Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            <ComplianceDashboardContent activeTab={activeTab as ComplianceView} />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default ComplianceDashboard;
