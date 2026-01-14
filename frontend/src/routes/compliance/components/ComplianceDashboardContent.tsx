import { lazy, memo } from 'react';

// Sub-components
const ComplianceOverview = lazy(() => import('./ComplianceOverview').then(m => ({ default: m.ComplianceOverview })));
const ComplianceConflicts = lazy(() => import('./ComplianceConflicts').then(m => ({ default: m.ComplianceConflicts })));
const ComplianceWalls = lazy(() => import('./ComplianceWalls').then(m => ({ default: m.ComplianceWalls })));
const CompliancePolicies = lazy(() => import('./CompliancePolicies').then(m => ({ default: m.CompliancePolicies })));

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardContentProps {
  activeTab: ComplianceView;
}

const ComplianceDashboardContentComponent = function ComplianceDashboardContent({ activeTab }: ComplianceDashboardContentProps) {
  switch (activeTab) {
    case 'overview': return <ComplianceOverview />;
    case 'conflicts': return <ComplianceConflicts />;
    case 'walls': return <ComplianceWalls />;
    case 'policies': return <CompliancePolicies />;
    default: return <ComplianceOverview />;
  }
};

export const ComplianceDashboardContent = memo(ComplianceDashboardContentComponent);
ComplianceDashboardContent.displayName = 'ComplianceDashboardContent';
