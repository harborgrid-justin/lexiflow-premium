/**
 * @module components/dashboard/Dashboard
 * @category Dashboard
 * @description Main dashboard component with real-time firm intelligence and personal
 * productivity center. Provides tabbed navigation across overview, tasks, and notifications.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Download, ShieldCheck } from 'lucide-react';
import React, { Suspense, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { TabbedPageLayout } from '@/components/ui/layouts/TabbedPageLayout/TabbedPageLayout';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { DashboardContent } from './DashboardContent';

// Utils & Config
import { DASHBOARD_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/utils/cn';

// Types
import type { User } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DashboardProps {
  /** Callback when a case is selected from the dashboard. */
  onSelectCase: (caseId: string) => void;
  /** Optional initial tab to display. */
  initialTab?: string;
  /** Current user information. */
  currentUser: User;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase, initialTab, currentUser }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setStoredTab] = useSessionStorage<string>('dashboard_active_tab', initialTab || 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setStoredTab(tab);
    });
  };

  const renderContent = () => {
    // Delegation to DashboardContent
    return <DashboardContent activeTab={activeTab} onSelectCase={onSelectCase} currentUser={currentUser} />;
  };

  return (
    <TabbedPageLayout
      pageTitle="Executive Dashboard"
      pageSubtitle="Real-time firm intelligence and personal productivity center."
      pageActions={
        <div className="flex items-center gap-2">
          <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
            <ShieldCheck className="h-3 w-3 mr-1" /> SYSTEM OPERATIONAL
          </span>
          <Button variant="outline" size="sm" icon={Download}>Export Report</Button>
        </div>
      }
      tabConfig={DASHBOARD_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Dashboard Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default Dashboard;
