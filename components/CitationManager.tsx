
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Library, CheckCircle, AlertTriangle, BookOpen, Search, Gavel, 
  Scale, ShieldAlert, FileText, Loader2, FileSearch
} from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { CitationLibrary } from './citation/CitationLibrary';
import { CitationDetail } from './citation/CitationDetail';
import { BriefAnalyzer } from './citation/BriefAnalyzer';
import { Citation } from '../types';
import { useMutation } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { useNotify } from '../hooks/useNotify';

type CitationView = 'library' | 'shepard' | 'bluebook' | 'analyzer';

interface CitationManagerProps {
    initialTab?: CitationView;
}

const PARENT_TABS = [
  {
    id: 'main', label: 'Authority', icon: Library,
    subTabs: [
      { id: 'library', label: 'Citation Library', icon: BookOpen },
      { id: 'analyzer', label: 'Brief Analyzer', icon: FileSearch },
      { id: 'shepard', label: 'Signal Check', icon: ShieldAlert },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Scale,
    subTabs: [
      { id: 'bluebook', label: 'Bluebook Formatter', icon: Gavel },
    ]
  }
];

export const CitationManager: React.FC<CitationManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<CitationView>('library');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Batch Verify Mutation
  const { mutate: verifyAll, isLoading: isVerifying } = useMutation(
      DataService.citations.verifyAll,
      {
          onSuccess: (result) => {
              const res = result as { checked: number, flagged: number };
              notify.success(`Verified ${res.checked} citations. ${res.flagged} flagged updates.`);
          }
      }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as CitationView);
    }
  }, []);

  const handleSelectCitation = (citation: Citation) => {
      setSelectedCitation(citation);
      setIsInspectorOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'library': return <CitationLibrary onSelect={handleSelectCitation} />;
        case 'analyzer': return <BriefAnalyzer />;
        case 'shepard': return (
            <div className={cn("h-full flex flex-col items-center justify-center text-center p-12", theme.text.tertiary)}>
                <ShieldAlert className="h-16 w-16 mb-4 opacity-20"/>
                <h3 className="text-lg font-medium">Shepard's Signal Check</h3>
                <p className="text-sm mt-2 max-w-md">
                    Real-time verification against KeyCite/Shepard's databases.
                    <br/>Ensure your authority is still good law.
                </p>
                <Button variant="primary" className="mt-6" onClick={() => verifyAll(undefined)} disabled={isVerifying} icon={isVerifying ? Loader2 : undefined}>
                    {isVerifying ? 'Checking...' : 'Run Batch Check'}
                </Button>
            </div>
        );
        case 'bluebook': return (
             <div className={cn("h-full flex flex-col items-center justify-center text-center p-12", theme.text.tertiary)}>
                <Gavel className="h-16 w-16 mb-4 opacity-20"/>
                <h3 className="text-lg font-medium">Bluebook Formatter</h3>
                <p className="text-sm mt-2 max-w-md">
                    Automated citation formatting for briefs and memoranda.
                    <br/>Supports Rule 10 (Cases) and Rule 12 (Statutes).
                </p>
                <Button variant="primary" className="mt-6">Open Formatter</Button>
            </div>
        );
        default: return <CitationLibrary onSelect={handleSelectCitation} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Citation Manager" 
          subtitle="Centralized authority tracking, signal checks, and cross-referencing."
          actions={
             <div className="flex gap-2">
                 <Button variant="secondary" icon={isVerifying ? Loader2 : CheckCircle} onClick={() => verifyAll(undefined)} disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : 'Verify All'}
                 </Button>
                 <Button variant="primary" icon={Search}>Search Westlaw/Lexis</Button>
             </div>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as CitationView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
         <div className={cn("flex-1 flex flex-col min-w-0 rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
            {renderContent()}
         </div>

         {/* Inspector Panel (Only on Library Tab) */}
         {activeTab === 'library' && isInspectorOpen && selectedCitation && (
            <div className="w-96 shrink-0">
                <CitationDetail 
                    citation={selectedCitation} 
                    onClose={() => setIsInspectorOpen(false)}
                />
            </div>
         )}
      </div>
    </div>
  );
};
