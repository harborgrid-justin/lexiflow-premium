/**
 * CaseList.tsx
 *
 * Main case management dashboard with tabbed interface for different case views.
 * Provides unified navigation across active cases, intake pipeline, dockets,
 * tasks, conflicts, resources, trust accounting, closing, and archives.
 *
 * @module components/case-list/CaseList
 * @category Case Management - List Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Download, Plus } from 'lucide-react';
import React, { Suspense, useTransition } from 'react';
import { CaseListContent } from './CaseListContent';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TabbedPageLayout } from '@/components/layouts';
import { Button } from '@/shared/ui/atoms/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';

// Hooks
import { useCaseList } from '@/hooks/useCaseList';
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Utils & Config
import { CASE_LIST_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { AppView, Case } from '@/types';

export type CaseListView = 'active' | 'intake' | 'docket' | 'tasks' | 'conflicts' | 'resources' | 'trust' | 'closing' | 'archived';

interface CaseListProps {
  onSelectCase: (caseData: Case) => void;
  initialTab?: CaseListView;
  setActiveView?: (view: AppView) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CaseList - Tabbed case management dashboard
 *
 * Features:
 * - 9 specialized views (active, intake, docket, tasks, conflicts, resources, trust, closing, archived)
 * - Session-persisted active tab
 * - Smooth transitions between views
 * - Create case modal integration
 * - Export functionality
 */
export const CaseList: React.FC<CaseListProps> = ({ onSelectCase, initialTab, setActiveView }) => {
  // ==========================================================================
  // HOOKS - State & Transitions
  // ==========================================================================
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('case_list_active_tab', initialTab || 'active');

  const caseListData = useCaseList();

  // ==========================================================================
  // CALLBACKS
  // ==========================================================================

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  /**
   * Navigate to full-page CreateCase component
   * WHY: Replaced modal with dedicated route for better UX and type safety
   */
  const handleCreateCase = () => {
    if (setActiveView) {
      setActiveView('matters/create' as AppView);
    } else {
      console.warn('setActiveView not provided to CaseList - cannot navigate to create case page');
    }
  };



  return (
    <TabbedPageLayout
      pageTitle="Matter Management"
      pageSubtitle="Centralized matter oversight, intake pipeline, conflicts, and case coordination."
      pageActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Download}>Export</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateCase}>
            New Matter
          </Button>
        </div>
      }
      tabConfig={CASE_LIST_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Matter Management..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          <CaseListContent
            activeTab={activeTab}
            onSelectCase={onSelectCase}
            caseListData={caseListData}
          />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default CaseList;
