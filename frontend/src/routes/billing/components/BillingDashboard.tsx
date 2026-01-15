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
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { ExportMenu } from '@/routes/discovery/components/ExportMenu/ExportMenu';
import { Button } from '@/components/atoms/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader';
import { PeriodSelector } from '@/components/molecules/PeriodSelector';
import { BillingDashboardContent } from './BillingDashboardContent';
import { BillingErrorBoundary } from './BillingErrorBoundary';

// Utils & Config
import { BILLING_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/lib/cn';

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
function BillingDashboardInternal({ navigateTo, initialTab }: BillingDashboardProps) {
  const [state, actions] = useBillingDashboard(initialTab, navigateTo);
  const { activeTab, period, status, isPending } = state;
  const { setActiveTab, setPeriod, syncFinancials, exportReport } = actions;

  const isSyncing = status === 'syncing';

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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => syncFinancials()} isLoading={isSyncing}>Sync</Button>
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

function BillingDashboard(props: BillingDashboardProps) {
  return (
    <BillingErrorBoundary>
      <BillingDashboardInternal {...props} />
    </BillingErrorBoundary>
  );
}

BillingDashboard.displayName = 'BillingDashboard';

export default BillingDashboard;
