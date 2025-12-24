/**
 * @module components/matters/MatterManagerContent
 * @category Matter Management
 * @description Content router for Matter Management module tabs
 */

import React, { lazy, Suspense } from 'react';
import { MatterView } from '../../../config/tabs.config';

// Lazy load tab content components - from Matter Management Suite
const MatterOverviewDashboard = lazy(() => import('../overview/MatterOverviewDashboard').then(m => ({ default: m.MatterOverviewDashboard })));
const MatterOperationsCenter = lazy(() => import('../operations/MatterOperationsCenter').then(m => ({ default: m.MatterOperationsCenter })));
const NewMatterIntakeForm = lazy(() => import('../intake/NewMatterIntakeForm').then(m => ({ default: m.NewMatterIntakeForm })));
const MatterCalendar = lazy(() => import('../calendar/MatterCalendar').then(m => ({ default: m.MatterCalendar })));
const MatterFinancialsCenter = lazy(() => import('../financials/MatterFinancialsCenter').then(m => ({ default: m.MatterFinancialsCenter })));
const MatterInsightsDashboard = lazy(() => import('../insights/MatterInsightsDashboard').then(m => ({ default: m.MatterInsightsDashboard })));
const MatterAnalyticsDashboard = lazy(() => import('../analytics/MatterAnalyticsDashboard').then(m => ({ default: m.MatterAnalyticsDashboard })));

interface MatterManagerContentProps {
  activeTab: MatterView;
  currentUserRole?: string;
}

export const MatterManagerContent: React.FC<MatterManagerContentProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MatterOverviewDashboard />;
      case 'operations':
        return <MatterOperationsCenter />;
      case 'intake':
        return <NewMatterIntakeForm />;
      case 'calendar':
        return <MatterCalendar />;
      case 'financials':
        return <MatterFinancialsCenter />;
      case 'insights':
        return <MatterInsightsDashboard />;
      case 'analytics':
        return <MatterAnalyticsDashboard />;
      default:
        return <MatterOverviewDashboard />;
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
