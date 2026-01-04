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
import React, { Suspense, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Components
import { TabbedPageLayout } from '@/components/layouts';
import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { ComplianceDashboardContent } from './ComplianceDashboardContent';

// Utils & Config
import { COMPLIANCE_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardProps {
  /** Optional initial tab to display. */
  initialTab?: ComplianceView;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
      tabConfig={COMPLIANCE_TAB_CONFIG as { id: string; label: string; icon: React.ComponentType }[]}
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
