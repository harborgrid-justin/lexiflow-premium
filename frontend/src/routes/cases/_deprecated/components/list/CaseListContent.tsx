import React from "react";

import { type UseCaseListReturn } from '@/hooks/useCaseList';
import { type Case } from '@/types';


import { CaseListTasks } from './CaseListTasks';
import { CaseListTrust } from './CaseListTrust';

import { CaseListActive, CaseListArchived, CaseListClosing, CaseListConflicts, CaseListDocket, CaseListIntake, CaseListResources } from './';

interface CaseListContentProps {
  activeTab: string;
  onSelectCase: (caseData: Case) => void;
  caseListData: UseCaseListReturn;
}

export const CaseListContent: React.FC<CaseListContentProps> = ({ activeTab, onSelectCase, caseListData }) => {
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
