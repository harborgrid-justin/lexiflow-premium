/**
 * @module components/billing/BillingDashboard
 * @category Billing
 * @description Main billing dashboard with tabbed navigation for WIP, invoices, and ledger.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { RefreshCw } from 'lucide-react';
import { Suspense } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useBillingDashboard } from './hooks/useBillingDashboard';

// Components
import { ExportMenu } from '@/features/discovery/ui/components/ExportMenu/ExportMenu';
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { Button } from '@/shared/ui/atoms/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader';
import { PeriodSelector } from '@/shared/ui/molecules/PeriodSelector';
import { BillingDashboardContent } from './BillingDashboardContent';
import { BillingErrorBoundary } from './BillingErrorBoundary';

// Utils & Config
import { BILLING_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BillingDashboardProps {
  /** Optional callback for navigation. */
  navigateTo?: (view: string) => void;
  /** Optional initial tab to display. */
  initialTab?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const BillingDashboardInternal: React.FC<BillingDashboardProps> = ({ navigateTo, initialTab }) => {
  const {
    activeTab,
    setActiveTab,
    period,
    setPeriod,
    syncFinancials,
    isSyncing,
    exportReport,
    isPending
  } = useBillingDashboard(initialTab, navigateTo);

  const renderContent = () => {
    // Delegation to BillingDashboardContent
    return <BillingDashboardContent activeTab={activeTab} navigateTo={navigateTo} />;
  };

  return (
    <TabbedPageLayout
      pageTitle="Billing & Finance"
      pageSubtitle="Revenue cycle management, invoicing, and firm accounting."
      pageActions={
        <div className="flex gap-3 items-center">
          <PeriodSelector selected={period} onChange={setPeriod} />
          <ExportMenu onExport={(format) => exportReport(format)} />
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => syncFinancials(undefined)} isLoading={isSyncing}>Sync</Button>
        </div>
      }
      tabConfig={BILLING_TAB_CONFIG as TabConfigItem[]}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Billing Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

const BillingDashboard: React.FC<BillingDashboardProps> = (props) => (
  <BillingErrorBoundary>
    <BillingDashboardInternal {...props} />
  </BillingErrorBoundary>
);

export default BillingDashboard;
