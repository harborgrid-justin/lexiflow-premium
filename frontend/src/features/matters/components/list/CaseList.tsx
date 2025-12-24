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
import React, { Suspense, useTransition } from 'react';
import { Plus, Download } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TabbedPageLayout } from '@/components/templates/TabbedPageLayout';
import { LazyLoader } from '@/components/molecules/LazyLoader';
import { Button } from '@/components/atoms/Button';
import { CaseListActive } from './CaseListActive';
import { CaseListIntake } from './CaseListIntake';
import { CaseListDocket } from './CaseListDocket';
import { CaseListTasks } from './CaseListTasks';
import { CaseListConflicts } from './CaseListConflicts';
import { CaseListResources } from './CaseListResources';
import { CaseListTrust } from './CaseListTrust';
import { CaseListClosing } from './CaseListClosing';
import { CaseListArchived } from './CaseListArchived';
// DEPRECATED: CreateCaseModal removed - use full-page CreateCase component via navigation

// Hooks
import { useCaseList } from '@/hooks/useCaseList';
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Utils & Config
import { cn } from '@/utils/cn';
import { CASE_LIST_TAB_CONFIG } from '@/config/tabs.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case, AppView } from '@/types';

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
  const { 
    statusFilter, 
    setStatusFilter, 
    typeFilter, 
    setTypeFilter, 
    searchTerm, 
    setSearchTerm,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredCases,
    resetFilters 
  } = caseListData;

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

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  const renderContent = () => {
    switch (activeTab) {
      case 'active':
        return <CaseListActive 
          onSelectCase={onSelectCase}
          filteredCases={filteredCases}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          resetFilters={resetFilters}
        />;
      case 'intake':
        return <CaseListIntake />;
      case 'docket':
        return <CaseListDocket onSelectCase={onSelectCase} />;
      case 'tasks':
        return <CaseListTasks onSelectCase={onSelectCase} />;
      case 'conflicts':
        return <CaseListConflicts onSelectCase={onSelectCase} />;
      case 'resources':
        return <CaseListResources />;
      case 'trust':
        return <CaseListTrust />;
      case 'closing':
        return <CaseListClosing />;
      case 'archived':
        return <CaseListArchived onSelectCase={onSelectCase} />;
      default:
        return <CaseListActive 
          onSelectCase={onSelectCase}
          filteredCases={filteredCases}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          resetFilters={resetFilters}
        />;
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
            {renderContent()}
          </div>
        </Suspense>
      </TabbedPageLayout>
  );
};

export default CaseList;
