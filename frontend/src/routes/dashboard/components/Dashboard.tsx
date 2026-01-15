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
import { Button } from '@/shared/ui/atoms/Button/Button';
import { TabbedPageLayout } from '@/shared/ui/layouts/TabbedPageLayout/TabbedPageLayout';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { DashboardProvider } from '../DashboardProvider';
import { DashboardContent } from './DashboardContent';

// Utils & Config
import { DASHBOARD_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/shared/lib/cn';

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
  /** Optional initial data */
  initialCases?: unknown[];
  initialDocketEntries?: unknown[];
  initialTimeEntries?: unknown[];
  initialTasks?: unknown[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectCase: _onSelectCase,
  initialTab,
  currentUser: _currentUser,
  initialCases,
  initialDocketEntries,
  initialTimeEntries,
  initialTasks
}) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setStoredTab] = useSessionStorage<string>('dashboard_active_tab', initialTab || 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setStoredTab(tab);
    });
  };

  return (
    <DashboardProvider
      initialCases={initialCases}
      initialDocketEntries={initialDocketEntries}
      initialTimeEntries={initialTimeEntries}
      initialTasks={initialTasks}
    >
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
            <DashboardContent />
          </div>
        </Suspense>
      </TabbedPageLayout>
    </DashboardProvider>
  );
};

export default Dashboard;
