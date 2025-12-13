
import React, { useState, Suspense, lazy } from 'react';
import { Citation } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { Plus, BookOpen, FileText } from 'lucide-react';
import { Tabs } from '../common/Tabs';
import { LazyLoader } from '../common/LazyLoader';

const CitationLibrary = lazy(() => import('./CitationLibrary').then(m => ({ default: m.CitationLibrary })));
const BriefAnalyzer = lazy(() => import('./BriefAnalyzer'));

type CitationView = 'library' | 'analyzer';

interface CitationManagerProps {
  caseId?: string;
}

export const CitationManager: React.FC<CitationManagerProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<CitationView>('library');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const tabs = [
    { id: 'library', label: 'Citation Library', icon: BookOpen },
    { id: 'analyzer', label: 'Brief Analyzer', icon: FileText },
  ];

  return (
    <div className={cn("h-full flex flex-col", theme.surface.default)}>
      <PageHeader
        title="Citation Manager"
        subtitle="Manage legal citations and analyze briefs"
        actions={
          <Button icon={Plus} size="sm">
            Add Citation
          </Button>
        }
      />

      <div className={cn("border-b", theme.border.default)}>
        <Tabs
          tabs={tabs}
          activeTab={activeView}
          onChange={(id: string) => setActiveView(id as CitationView)}
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={<LazyLoader message="Loading citation data..." />}>
          {activeView === 'library' && (
            <CitationLibrary onSelect={setSelectedCitation} />
          )}
          {activeView === 'analyzer' && <BriefAnalyzer />}
        </Suspense>
      </div>
    </div>
  );
};

export default CitationManager;
