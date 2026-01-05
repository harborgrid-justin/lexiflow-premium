/**
 * @module components/cases/CaseManagerContent
 * @category Case Management
 * @description Content router for Case Management module tabs
 */

import { api } from '@/api';
import { MatterView } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { Case } from '@/types';
import React, { lazy, useState } from 'react';

// Lazy load tab content components - from Case Management Suite
const CaseOverviewDashboard = lazy(() => import('../overview/CaseOverviewDashboard').then(m => ({ default: m.CaseOverviewDashboard })));
const CaseOperationsCenter = lazy(() => import('../operations/CaseOperationsCenter'));
const CaseCalendar = lazy(() => import('../calendar/CaseCalendar').then(m => ({ default: m.CaseCalendar })));
const CaseFinancialsCenter = lazy(() => import('../financials/CaseFinancialsCenter').then(m => ({ default: m.CaseFinancialsCenter })));
const CaseInsightsDashboard = lazy(() => import('../insights/CaseInsightsDashboard').then(m => ({ default: m.CaseInsightsDashboard })));
const CaseAnalyticsDashboard = lazy(() => import('../analytics/CaseAnalyticsDashboard').then(m => ({ default: m.CaseAnalyticsDashboard })));

// Import existing list views
const CaseListActive = lazy(() => import('./CaseListActive').then(m => ({ default: m.CaseListActive })));
const CaseListIntake = lazy(() => import('./CaseListIntake').then(m => ({ default: m.CaseListIntake })));
const CaseImporter = lazy(() => import('../import/CaseImporter').then(m => ({ default: m.CaseImporter })));
const CaseListDocket = lazy(() => import('./CaseListDocket').then(m => ({ default: m.CaseListDocket })));
const CaseListTasks = lazy(() => import('./CaseListTasks').then(m => ({ default: m.CaseListTasks })));
const CaseListConflicts = lazy(() => import('./CaseListConflicts').then(m => ({ default: m.CaseListConflicts })));
const CaseListResources = lazy(() => import('./CaseListResources').then(m => ({ default: m.CaseListResources })));
const CaseListExperts = lazy(() => import('./CaseListExperts').then(m => ({ default: m.CaseListExperts })));
const CaseListReporters = lazy(() => import('./CaseListReporters').then(m => ({ default: m.CaseListReporters })));
const CaseListTrust = lazy(() => import('./CaseListTrust').then(m => ({ default: m.CaseListTrust })));
const CaseListClosing = lazy(() => import('./CaseListClosing').then(m => ({ default: m.CaseListClosing })));
const CaseListArchived = lazy(() => import('./CaseListArchived').then(m => ({ default: m.CaseListArchived })));
const CaseListMisc = lazy(() => import('./CaseListMisc').then(m => ({ default: m.CaseListMisc })));

// Import workflow components
const MasterWorkflow = lazy(() => import('../workflow/MasterWorkflow').then(m => ({ default: m.default })));

interface CaseManagerContentProps {
  activeTab: MatterView | string;
  currentUserRole?: string;
  onSelectCase?: (id: string) => void;
}

export const CaseManagerContent: React.FC<CaseManagerContentProps> = ({ activeTab, onSelectCase }) => {
  // Fetch cases for list views that need them
  const { data: cases = [] } = useQuery<Case[]>(['cases', 'all'], () => api.cases.getAll());

  // Filter state for CaseListActive
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const resetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const handleCaseSelect = (c: any) => {
    if (onSelectCase) {
      onSelectCase(c.id || c);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CaseOverviewDashboard />;
      case 'active':
        return <CaseListActive
          filteredCases={cases}
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
          onSelectCase={handleCaseSelect}
        />;
      case 'intake':
        return <CaseListIntake />;
      case 'import':
        return <CaseImporter />;
      case 'operations':
        return <CaseOperationsCenter />;
      case 'workflows':
        return <MasterWorkflow onSelectCase={handleCaseSelect} />;
      case 'docket':
        return <CaseListDocket onSelectCase={handleCaseSelect} />;
      case 'tasks':
        return <CaseListTasks onSelectCase={handleCaseSelect} />;
      case 'conflicts':
        return <CaseListConflicts onSelectCase={handleCaseSelect} />;
      case 'calendar':
        return <CaseCalendar />;
      case 'financials':
        return <CaseFinancialsCenter />;
      case 'insights':
        return <CaseInsightsDashboard />;
      case 'resources':
        return <CaseListResources />;
      case 'experts':
        return <CaseListExperts />;
      case 'reporters':
        return <CaseListReporters />;
      case 'trust':
        return <CaseListTrust />;
      case 'closing':
        return <CaseListClosing />;
      case 'archived':
        return <CaseListArchived onSelectCase={handleCaseSelect} />;
      case 'misc':
        return <CaseListMisc />;
      case 'analytics':
        return <CaseAnalyticsDashboard />;
      default:
        return <CaseOverviewDashboard />;
    }
  };

  // No Suspense boundary here - parent CaseManagement component handles it
  return renderContent();
};
