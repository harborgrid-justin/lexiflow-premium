import React, { lazy } from 'react';

// Sub-components
const ComplianceOverview = lazy(() => import('./ComplianceOverview').then(m => ({ default: m.ComplianceOverview })));
const ComplianceConflicts = lazy(() => import('./ComplianceConflicts').then(m => ({ default: m.ComplianceConflicts })));
const ComplianceWalls = lazy(() => import('./ComplianceWalls').then(m => ({ default: m.ComplianceWalls })));
const CompliancePolicies = lazy(() => import('./CompliancePolicies').then(m => ({ default: m.CompliancePolicies })));

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardContentProps {
  activeTab: ComplianceView;
}

export const ComplianceDashboardContent: React.FC<ComplianceDashboardContentProps> = ({ activeTab }) => {
  // Mock data for conflicts and walls, in a real app these would come from useQuery
  const mockConflicts = [];
  const mockWalls = [];

  switch (activeTab) {
    case 'overview': return <ComplianceOverview />;
    case 'conflicts': return <ComplianceConflicts conflicts={mockConflicts} />;
    case 'walls': return <ComplianceWalls walls={mockWalls} />;
    case 'policies': return <CompliancePolicies />;
    default: return <ComplianceOverview />;
  }
};
