
import React, { useState, Suspense, lazy } from 'react';
import { GitMerge, Save, Play, Milestone, FileText, Gavel, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { LazyLoader } from './common/LazyLoader';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { Button } from './common/Button';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';

// Lazy Load sub-components
const StrategyCanvas = lazy(() => import('./litigation/StrategyCanvas').then(m => ({ default: m.StrategyCanvas })));
const PlaybookLibrary = lazy(() => import('./litigation/PlaybookLibrary').then(m => ({ default: m.PlaybookLibrary })));
const OutcomeSimulator = lazy(() => import('./litigation/OutcomeSimulator').then(m => ({ default: m.OutcomeSimulator })));
const LitigationGanttView = lazy(() => import('./litigation/LitigationGanttView').then(m => ({ default: m.LitigationGanttView })));

const LITIGATION_TABS: TabConfigItem[] = [
  {
    id: 'design', label: 'Strategy Design', icon: GitMerge,
    subTabs: [
      { id: 'canvas', label: 'Visual Map', icon: GitMerge },
      { id: 'timeline', label: 'Gantt View', icon: Milestone },
      { id: 'templates', label: 'Playbooks', icon: FileText },
    ]
  },
  {
    id: 'analysis', label: 'Analysis', icon: Play,
    subTabs: [
      { id: 'simulate', label: 'Outcome Simulator', icon: Play },
    ]
  }
];

export const LitigationBuilder: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('canvas');
  
  // LIFTED STATE: `useWorkflowBuilder` now lives here as the source of truth
  const workflowProps = useWorkflowBuilder(null);

  return (
    <TabbedPageLayout
      pageTitle="Litigation Strategy Builder"
      pageSubtitle="Design case lifecycles, map motion sequences, and visualize network boundaries."
      pageActions={
        <div className="flex gap-2">
            <Button variant="outline" icon={Settings}>Config</Button>
            <Button variant="primary" icon={Save}>Save Strategy</Button>
        </div>
      }
      tabConfig={LITIGATION_TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <div className={cn("h-full w-full", theme.background)}>
        <Suspense fallback={<LazyLoader message="Loading Strategy Engine..." />}>
            {activeTab === 'canvas' && <StrategyCanvas {...workflowProps} />}
            {activeTab === 'timeline' && <LitigationGanttView {...workflowProps} />}
            {activeTab === 'templates' && <PlaybookLibrary />}
            {activeTab === 'simulate' && <OutcomeSimulator />}
        </Suspense>
      </div>
    </TabbedPageLayout>
  );
};
