/**
 * @module components/cases/CaseManagerContent
 * @category Case Management
 * @description Content router for Case Management module tabs
 */

import React, { lazy, Suspense } from 'react';
import { MatterView } from '@/config/tabs.config';

// Lazy load tab content components - from Case Management Suite
const CaseOverviewDashboard = lazy(() => import('../overview/CaseOverviewDashboard').then(m => ({ default: m.CaseOverviewDashboard })));
const CaseOperationsCenter = lazy(() => import('../operations/CaseOperationsCenter').then(m => ({ default: m.CaseOperationsCenter })));
const NewCaseIntakeForm = lazy(() => import('../intake/NewCaseIntakeForm').then(m => ({ default: m.NewCaseIntakeForm })));
const CaseCalendar = lazy(() => import('../calendar/CaseCalendar').then(m => ({ default: m.CaseCalendar })));
const CaseFinancialsCenter = lazy(() => import('../financials/CaseFinancialsCenter').then(m => ({ default: m.CaseFinancialsCenter })));
const CaseInsightsDashboard = lazy(() => import('../insights/CaseInsightsDashboard').then(m => ({ default: m.CaseInsightsDashboard })));
const CaseAnalyticsDashboard = lazy(() => import('../analytics/CaseAnalyticsDashboard').then(m => ({ default: m.CaseAnalyticsDashboard })));

interface CaseManagerContentProps {
  activeTab: MatterView;
  currentUserRole?: string;
}

export const CaseManagerContent: React.FC<CaseManagerContentProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CaseOverviewDashboard />;
      case 'operations':
        return <CaseOperationsCenter />;
      case 'intake':
        return <NewCaseIntakeForm />;
      case 'calendar':
        return <CaseCalendar />;
      case 'financials':
        return <CaseFinancialsCenter />;
      case 'insights':
        return <CaseInsightsDashboard />;
      case 'analytics':
        return <CaseAnalyticsDashboard />;
      default:
        return <CaseOverviewDashboard />;
    }
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Loading...</div>
      </div>
    }>
      {renderContent()}
    </Suspense>
  );
};
