
import React, { lazy } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { ConflictCheck, EthicalWall } from '@/types';

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
  const { data: conflicts = [] } = useQuery<ConflictCheck[]>(queryKeys.compliance.conflicts(), () => DataService.compliance.getConflicts());
  const { data: walls = [] } = useQuery<EthicalWall[]>(queryKeys.compliance.ethicalWalls(), () => DataService.compliance.getEthicalWalls());

  switch (activeTab) {
    case 'overview': return <ComplianceOverview />;
    case 'conflicts': return <ComplianceConflicts conflicts={conflicts} />;
    case 'walls': return <ComplianceWalls walls={walls} />;
    case 'policies': return <CompliancePolicies />;
    default: return <ComplianceOverview />;
  }
};


