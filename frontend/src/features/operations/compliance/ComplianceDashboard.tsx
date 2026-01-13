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
// Hooks
import { ComplianceView, useComplianceDashboard } from './hooks/useComplianceDashboard';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { TabbedPageLayout } from '@/shared/ui/layouts/TabbedPageLayout/TabbedPageLayout';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import type { TabConfigItem } from '@/types/layout';
import { ComplianceDashboardContent } from './ComplianceDashboardContent';

// Utils & Config
import { COMPLIANCE_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/shared/lib/cn';

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

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ initialTab }) => {
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
