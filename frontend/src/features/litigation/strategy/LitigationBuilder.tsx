/**
 * @module components/litigation/LitigationBuilder
 * @category Litigation
 * @description Strategy builder with visual mapping and Gantt timeline.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

import { Loader2, Rocket, Save } from 'lucide-react';
import React, { Suspense, lazy, useState } from 'react';

// Internal Components
import { TabbedPageLayout } from '@/components/layouts';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';
import { Button } from '@/components/ui/atoms/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader';

// Hooks & Context
import { useLitigationBuilder } from '@/hooks/useLitigationBuilder';
import { useTheme } from '@/providers/ThemeContext';

// Utils
import { cn } from '@/utils/cn';

// Constants & Types
import { LITIGATION_TABS } from './constants';
import { LitigationBuilderProps } from './types';

// Lazy Load sub-components
const StrategyCanvas = lazy(() => import('./StrategyCanvas').then(m => ({ default: m.StrategyCanvas })));
const PlaybookLibrary = lazy(() => import('./PlaybookLibrary').then(m => ({ default: m.PlaybookLibrary })));
const OutcomeSimulator = lazy(() => import('./OutcomeSimulator').then(m => ({ default: m.OutcomeSimulator })));
const LitigationScheduleView = lazy(() => import('./LitigationScheduleView').then(m => ({ default: m.LitigationScheduleView })));

export const LitigationBuilder: React.FC<LitigationBuilderProps> = ({ navigateToCaseTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('canvas');

  // LIFTED STATE: `useLitigationBuilder` now lives here as the source of truth
  const builderProps = useLitigationBuilder({ navigateToCaseTab });
  const { cases, selectedCaseId, setSelectedCaseId, deployToCase, isDeploying } = builderProps;

  // Ensure cases is always an array
  const safeCases = Array.isArray(cases) ? cases : [];

  return (
    <TabbedPageLayout
      pageTitle="Litigation Strategy"
      pageSubtitle="Design case lifecycles, map motion sequences, and visualize strategic timelines."
      pageActions={
        <div className="flex gap-2 items-center">
          <select
            value={selectedCaseId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCaseId(e.target.value)}
            className={cn("p-2 border rounded text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
          >
            <option value="">Select a Case to Deploy To...</option>
            {safeCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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
        <ErrorBoundary>
          <Suspense fallback={<LazyLoader message="Loading Strategy Engine..." />}>
            {activeTab === 'canvas' && <StrategyCanvas {...builderProps} />}
            {activeTab === 'timeline' && <LitigationScheduleView {...builderProps} />}
            {activeTab === 'templates' && <PlaybookLibrary onApply={(p) => builderProps.loadPlaybook(p)} />}
            {activeTab === 'simulate' && <OutcomeSimulator />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </TabbedPageLayout>
  );
};
export default LitigationBuilder;
