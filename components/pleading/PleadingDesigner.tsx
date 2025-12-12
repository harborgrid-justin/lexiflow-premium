
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PleadingDocument, FormattingRule, Case, PleadingSection } from '../../types';
import { ArrowLeft, Save, Eye, PenTool, GitMerge, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useNotify } from '../../hooks/useNotify';
import { LazyLoader } from '../common/LazyLoader';

// Lazy load new designer components with corrected relative paths
const PleadingPaper = lazy(() => import('./designer/PleadingPaper'));
const PleadingCanvas = lazy(() => import('./designer/PleadingCanvas'));
const AIDraftingAssistant = lazy(() => import('./modules/AIDraftingAssistant').then(module => ({ default: module.AIDraftingAssistant })));
const ContextPanel = lazy(() => import('./sidebar/ContextPanel'));
const ComplianceHUD = lazy(() => import('./tools/ComplianceHUD'));
const LogicOverlay = lazy(() => import('./visual/LogicOverlay'));

interface PleadingDesignerProps {
  pleading: PleadingDocument;
  onBack: () => void;
}

type ViewMode = 'write' | 'logic' | 'preview';

const PleadingDesigner: React.FC<PleadingDesignerProps> = ({ pleading: initialDoc, onBack }) => {
  const { theme } = useTheme();
  const notify = useNotify();

  const [document, setDocument] = useState<PleadingDocument>(initialDoc);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('write');
  
  // Data Fetching
  const { data: formattingRules, isLoading: rulesLoading } = useQuery<FormattingRule>(
    ['format_rules', document.jurisdictionRulesId],
    () => DataService.pleadings.getFormattingRules()
  );
  
  const { data: caseData, isLoading: caseLoading } = useQuery<Case | undefined>(
      [STORES.CASES, document.caseId],
      () => DataService.cases.getById(document.caseId)
  );

  // Mutations
  const { mutate: saveDocument, isLoading: isSaving } = useMutation(
    (doc: PleadingDocument) => DataService.pleadings.update(doc.id, doc),
    {
      onSuccess: (updatedDoc) => {
        setDocument(updatedDoc);
        queryClient.invalidate([STORES.PLEADINGS, document.caseId]);
        notify.success("Document auto-saved.");
      },
      onError: () => notify.error("Save failed.")
    }
  );
  
  // Auto-save logic
  useEffect(() => {
    const handler = setTimeout(() => saveDocument(document), 2000);
    return () => clearTimeout(handler);
  }, [document, saveDocument]);

  const handleUpdateSection = (id: string, updates: Partial<PleadingSection>) => {
    setDocument(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleInsertText = (text: string) => {
      if (selectedSectionId) {
          const section = document.sections.find(s => s.id === selectedSectionId);
          if (section) handleUpdateSection(selectedSectionId, { content: section.content + '\n\n' + text });
      }
  };

  if (rulesLoading || caseLoading) return <LazyLoader message="Loading Designer Environment..."/>;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Top Toolbar */}
      <div className={cn("h-16 border-b flex justify-between items-center px-4 shrink-0 z-20", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to Workspace</Button>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
          <h2 className={cn("font-bold", theme.text.primary)}>{document.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("flex p-1 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            {(['write', 'logic', 'preview'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={cn("px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all", viewMode === mode ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}>
                {mode === 'write' && <PenTool className="h-3 w-3"/>}
                {mode === 'logic' && <GitMerge className="h-3 w-3"/>}
                {mode === 'preview' && <Eye className="h-3 w-3"/>}
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </div>
          <Button variant="primary" icon={Save} onClick={() => saveDocument(document)} isLoading={isSaving}>Save</Button>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Context */}
        <aside className={cn("w-80 border-r flex flex-col shrink-0", theme.surface.default, theme.border.default)}>
          <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
            <ContextPanel caseId={document.caseId} onInsertFact={handleInsertText} />
          </Suspense>
        </aside>
        
        {/* Center Panel: Canvas */}
        <main className="flex-1 overflow-auto p-8 relative">
          <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
            <PleadingPaper rules={formattingRules!}>
                <PleadingCanvas 
                    document={document} 
                    rules={formattingRules!}
                    readOnly={viewMode === 'preview'} 
                    viewMode={viewMode}
                    onUpdateSection={handleUpdateSection}
                    relatedCase={caseData || null}
                />
                {viewMode === 'logic' && <LogicOverlay document={document} />}
            </PleadingPaper>
            <ComplianceHUD rules={formattingRules!} sections={document.sections} score={100}/>
          </Suspense>
        </main>

        {/* Right Panel: AI Assistant */}
        <aside className={cn("w-80 border-l flex flex-col shrink-0", theme.surface.default, theme.border.default)}>
          <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
            <AIDraftingAssistant 
              onInsert={handleInsertText} 
              caseContext={{ title: caseData?.title || '', summary: caseData?.description }}
            />
          </Suspense>
        </aside>
      </div>
    </div>
  );
};
export default PleadingDesigner;
