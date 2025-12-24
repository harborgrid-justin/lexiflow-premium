/**
 * @module components/citation/CitationManager
 * @category Citations
 * @description Citation management with validation and Bluebook formatting.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy, useTransition } from 'react';
import { Plus, BookOpen, FileText } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TabbedPageLayout, TabConfigItem } from '@/components/templates/TabbedPageLayout';
import { Button } from '@/components/atoms/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Hooks
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useSelection } from '@/hooks/useSelectionState';

// Utils
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Citation } from '@/types';
import { CitationManagerProps } from './types';

const CitationLibrary = lazy(() => import('./CitationLibrary').then(m => ({ default: m.CitationLibrary })));
const BriefAnalyzer = lazy(() => import('./BriefAnalyzer'));

const TAB_CONFIG: TabConfigItem[] = [
  { 
    id: 'citations', 
    label: 'Citations', 
    icon: BookOpen,
    subTabs: [
      { id: 'library', label: 'Citation Library', icon: BookOpen },
      { id: 'analyzer', label: 'Brief Analyzer', icon: FileText },
    ]
  },
];

export const CitationManager: React.FC<CitationManagerProps> = ({ caseId }) => {
  const [isPending, startTransition] = useTransition();
  const [activeView, _setActiveView] = useSessionStorage<string>('citation_active_tab', 'library');
  const citationSelection = useSelection<Citation>();

  const setActiveView = (tab: string) => {
    startTransition(() => {
      _setActiveView(tab);
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'library':
        return <CitationLibrary onSelect={citationSelection.select} caseId={caseId} />;
      case 'analyzer':
        return <BriefAnalyzer />;
      default:
        return <CitationLibrary onSelect={citationSelection.select} caseId={caseId} />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Citation Manager"
      pageSubtitle="Manage legal citations and analyze briefs with Bluebook formatting."
      pageActions={
        <Button icon={Plus} size="sm">
          Add Citation
        </Button>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeView}
      onTabChange={setActiveView}
    >
      <Suspense fallback={<LazyLoader message="Loading citation data..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default CitationManager;
