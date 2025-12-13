import React, { Suspense, useTransition } from 'react';
import { Case } from '../../types';
import { useCaseList } from '../../hooks/useCaseList';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { Button } from '../common/Button';
import { Plus, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CASE_LIST_TAB_CONFIG } from '../../config/caseListConfig';
import { CaseListActive } from './CaseListActive';
import { CaseListIntake } from './CaseListIntake';
import { CaseListDocket } from './CaseListDocket';
import { CaseListTasks } from './CaseListTasks';
import { CaseListConflicts } from './CaseListConflicts';
import { CaseListResources } from './CaseListResources';
import { CaseListTrust } from './CaseListTrust';
import { CaseListClosing } from './CaseListClosing';
import { CaseListArchived } from './CaseListArchived';
import { CreateCaseModal } from './CreateCaseModal';

export type CaseListView = 'active' | 'intake' | 'docket' | 'tasks' | 'conflicts' | 'resources' | 'trust' | 'closing' | 'archived';

interface CaseListProps {
  onSelectCase: (caseData: Case) => void;
  initialTab?: CaseListView;
}

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase, initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('case_list_active_tab', initialTab || 'active');
  
  const caseListData = useCaseList();
  const { 
    isModalOpen, 
    setIsModalOpen, 
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

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

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
    <>
      {isModalOpen && <CreateCaseModal onClose={() => setIsModalOpen(false)} />}
      
      <TabbedPageLayout
        pageTitle="Matter Management"
        pageSubtitle="Centralized case oversight, intake pipeline, and resource coordination."
        pageActions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Download}>Export</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              New Case
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
    </>
  );
};

export default CaseList;