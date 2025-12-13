import React, { useState, Suspense, lazy } from 'react';
import { GitMerge, Save, Play, Milestone, FileText, Settings, Rocket, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { LazyLoader } from '../common/LazyLoader';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { Button } from '../common/Button';
import { useLitigationBuilder } from '../../hooks/useLitigationBuilder';
import { ContextMenuItem } from '../common/ContextMenu';
import { Edit2, Copy, Trash2, Layout, BoxSelect } from 'lucide-react';

// Lazy Load sub-components with named export handling
const StrategyCanvas = lazy(() => import('./StrategyCanvas').then(m => ({ default: m.StrategyCanvas })));
const PlaybookLibrary = lazy(() => import('./PlaybookLibrary').then(m => ({ default: m.PlaybookLibrary })));
const OutcomeSimulator = lazy(() => import('./OutcomeSimulator').then(m => ({ default: m.OutcomeSimulator })));
const LitigationGanttView = lazy(() => import('./LitigationGanttView').then(m => ({ default: m.LitigationGanttView })));

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

interface LitigationBuilderProps {
  navigateToCaseTab: (caseId: string, tab: string) => void;
}

export const LitigationBuilder: React.FC<LitigationBuilderProps> = ({ navigateToCaseTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('canvas');
  
  // LIFTED STATE: `useLitigationBuilder` now lives here as the source of truth
  const builderProps = useLitigationBuilder({ navigateToCaseTab });
  const { cases, selectedCaseId, setSelectedCaseId, deployToCase, isDeploying } = builderProps;

  return (
    <TabbedPageLayout
      pageTitle="Litigation Strategy Builder"
      pageSubtitle="Design case lifecycles, map motion sequences, and visualize network boundaries."
      pageActions={
        <div className="flex gap-2 items-center">
            <select
                value={selectedCaseId || ''}
                onChange={e => setSelectedCaseId(e.target.value)}
                className={cn("p-2 border rounded text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
            >
                <option value="">Select a Case to Deploy To...</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <Button variant="primary" icon={isDeploying ? Loader2 : Rocket} onClick={deployToCase} disabled={!selectedCaseId || isDeploying}>
                {isDeploying ? 'Deploying...' : 'Deploy'}
            </Button>
            <Button variant="outline" icon={Save}>Save Draft</Button>
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