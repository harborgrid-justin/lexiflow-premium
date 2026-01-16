/**
 * @module components/compliance/ComplianceDashboard
 * @category Compliance
 * @description Compliance monitoring dashboard with conflict checks and ethics tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Download } from 'lucide-react';
import { Suspense } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================

// Types
import type { TabConfigItem } from '@/types/layout';

// Hooks (feature-scoped)
import { type ComplianceView, useComplianceDashboard } from '../../compliance/hooks/useComplianceDashboard';

// Components - Atoms
import { Button } from '@/components/atoms/Button';

// Components - Molecules
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Components - Layouts
import { TabbedPageLayout } from '@/components/layouts/TabbedPageLayout';

// Feature Components
import { ComplianceDashboardContent } from './ComplianceDashboardContent';

// Utils & Config
import { COMPLIANCE_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComplianceDashboardProps {
  /** Optional initial tab to display. */
  initialTab?: ComplianceView;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComplianceDashboard({ initialTab }: ComplianceDashboardProps) {
  const [state, actions] = useComplianceDashboard(initialTab);
  const { activeTab, status } = state;
  const { setActiveTab } = actions;

  const isPending = status === 'pending';

  return (
    <TabbedPageLayout
      pageTitle="Risk & Compliance Center"
      pageSubtitle="Conflicts, Ethical Walls, and Regulatory Monitoring."
      pageActions={<Button variant="secondary" icon={Download}>Audit Report</Button>}
      tabConfig={COMPLIANCE_TAB_CONFIG as TabConfigItem[]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as ComplianceView)}
    >
      <Suspense fallback={<LazyLoader message="Loading Compliance Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          <ComplianceDashboardContent activeTab={activeTab} />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default ComplianceDashboard;
