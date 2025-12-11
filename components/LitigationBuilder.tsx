
import React, { useState, Suspense, lazy } from 'react';
import { GitMerge, Save, Play, Milestone, FileText, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { LazyLoader } from './common/LazyLoader';
import { TabbedPageLayout } from './layout/TabbedPageLayout';
import { Button } from './common/Button';
import { useLitigationBuilder } from '../hooks/useLitigationBuilder';
import { ContextMenuItem } from './common/ContextMenu';
import { Edit2, Copy, Trash2, Layout, BoxSelect } from 'lucide-react';

// Lazy Load sub-components
const StrategyCanvas = lazy(() => import('./litigation/StrategyCanvas'));
const PlaybookLibrary = lazy(() => import('./litigation/PlaybookLibrary'));
const OutcomeSimulator = lazy(() => import('./litigation/OutcomeSimulator'));
const LitigationGanttView = lazy(() => import('./litigation/LitigationGanttView'));

const LITIGATION_TABS = [
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
  
  // LIFTED STATE: `useLitigationBuilder` now lives here as the source of truth
  const builderProps = useLitigationBuilder();

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
            {activeTab === 'canvas' && <StrategyCanvas {...builderProps} />}
            {activeTab === 'timeline' && <LitigationGanttView {...builderProps} />}
            {activeTab === 'templates' && <PlaybookLibrary onApply={(p) => builderProps.loadFromPlaybook(p)} />}
            {activeTab === 'simulate' && <OutcomeSimulator />}
        </Suspense>
      </div>
    </TabbedPageLayout>
  );
};
export default LitigationBuilder;