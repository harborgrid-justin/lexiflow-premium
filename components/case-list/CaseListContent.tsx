
// components/case-list/CaseListContent.tsx
import React, { Suspense, lazy } from 'react';
import { Case } from '../../types';
import { LazyLoader } from '../common/LazyLoader';
import { CaseListToolbar } from './CaseListToolbar';
import { UseCaseListReturn } from '../../hooks/useCaseList';

const CaseListActive = lazy(() => import('./CaseListActive'));
const CaseListIntake = lazy(() => import('./CaseListIntake'));
const CaseListDocket = lazy(() => import('./CaseListDocket'));
const CaseListTasks = lazy(() => import('./CaseListTasks'));
const CaseListConflicts = lazy(() => import('./CaseListConflicts'));
const CaseListResources = lazy(() => import('./CaseListResources'));
const CaseListTrust = lazy(() => import('./CaseListTrust'));
const CaseListExperts = lazy(() => import('./CaseListExperts'));
const CaseListReporters = lazy(() => import('./CaseListReporters'));
const CaseListClosing = lazy(() => import('./CaseListClosing'));
const CaseListArchived = lazy(() => import('./CaseListArchived'));

interface CaseListContentProps {
  activeTab: string;
  onSelectCase: (c: Case) => void;
  caseListProps: UseCaseListReturn;
}

export const CaseListContent: React.FC<CaseListContentProps> = ({ activeTab, onSelectCase, caseListProps }) => {
  const { filteredCases, statusFilter, setStatusFilter, typeFilter, setTypeFilter, searchTerm, setSearchTerm, dateFrom, setDateFrom, dateTo, setDateTo, resetFilters } = caseListProps;

  const renderContent = () => {
    switch (activeTab) {
      case 'active': 
        return <CaseListActive 
          filteredCases={filteredCases}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          resetFilters={resetFilters}
          onSelectCase={onSelectCase}
        />;
      case 'intake': return <CaseListIntake />;
      case 'docket': return <CaseListDocket onSelectCase={onSelectCase} />;
      case 'tasks': return <CaseListTasks onSelectCase={onSelectCase} />;
      case 'conflicts': return <CaseListConflicts onSelectCase={onSelectCase} />;
      case 'resources': return <CaseListResources />;
      case 'trust': return <CaseListTrust />;
      case 'experts': return <CaseListExperts />;
      case 'reporters': return <CaseListReporters />;
      case 'closing': return <CaseListClosing />;
      case 'archived': return <CaseListArchived onSelectCase={onSelectCase} />;
      default: return <CaseListActive filteredCases={filteredCases} statusFilter={statusFilter} setStatusFilter={setStatusFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} searchTerm={searchTerm} setSearchTerm={setSearchTerm} dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} resetFilters={resetFilters} onSelectCase={onSelectCase} />;
    }
  };

  return (
    <>
      {activeTab === 'active' && (
         <div className="mb-4 shrink-0">
            <CaseListToolbar 
                statusFilter={statusFilter} 
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                resetFilters={resetFilters}
            />
         </div>
      )}
      <div className="flex-1 min-h-0 relative">
        <Suspense fallback={<LazyLoader message="Loading View..." />}>
          {renderContent()}
        </Suspense>
      </div>
    </>
  );
};
