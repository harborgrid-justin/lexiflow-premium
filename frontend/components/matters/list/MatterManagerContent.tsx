/**
 * @module components/matters/MatterManagerContent
 * @category Matter Management
 * @description Content router for Matter Management module tabs
 */

import React, { lazy } from 'react';
import { MatterView } from '../../../config/tabs.config';

// Lazy load tab content components
const MatterListView = lazy(() => import('./MatterListView').then(m => ({ default: m.MatterListView })));
const MatterAnalyticsView = lazy(() => import('./MatterAnalyticsView').then(m => ({ default: m.MatterAnalyticsView })));

interface MatterManagerContentProps {
  activeTab: MatterView;
  currentUserRole?: string;
}

export const MatterManagerContent: React.FC<MatterManagerContentProps> = ({ activeTab, currentUserRole }) => {
  switch (activeTab) {
    case 'all':
    case 'active':
    case 'intake':
      return <MatterListView filter={activeTab} currentUserRole={currentUserRole} />;
    case 'calendar':
      return <MatterListView filter="calendar" currentUserRole={currentUserRole} />;
    case 'financials':
      return <MatterListView filter="financials" currentUserRole={currentUserRole} />;
    case 'team':
      return <MatterListView filter="team" currentUserRole={currentUserRole} />;
    case 'analytics':
      return <MatterAnalyticsView />;
    default:
      return <MatterListView filter="all" currentUserRole={currentUserRole} />;
  }
};
