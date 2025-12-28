
import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { PleadingDocument, FormattingRule, Case, PleadingSection } from '@/types';
import { ArrowLeft, Save, Eye, PenTool, GitMerge, Loader2, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { useNotify } from '@/hooks/useNotify';
import { LazyLoader } from '@/components/molecules/LazyLoader';
import { ViewMode, PleadingDesignerProps } from './types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useHistory } from '@/hooks/useHistory';
import { VersionConflictError } from '@/services/data/repositories/PleadingRepository';
import { useSingleSelection } from '@/hooks/useMultiSelection';
import { ErrorState } from '@/components/molecules/ErrorState';

// Lazy load new designer components with corrected relative paths
const PleadingPaper = lazy(() => import('./designer/PleadingPaper'));
const PleadingCanvas = lazy(() => import('./designer/PleadingCanvas'));
const AIDraftingAssistant = lazy(() => import('./modules/AIDraftingAssistant').then(module => ({ default: module.AIDraftingAssistant })));
const ContextPanel = lazy(() => import('./sidebar/ContextPanel'));
const ComplianceHUD = lazy(() => import('./tools/ComplianceHUD'));
const LogicOverlay = lazy(() => import('./visual/LogicOverlay'));

const PleadingDesigner: React.FC<PleadingDesignerProps> = ({ pleading: initialDoc, onBack }) => {
  const { theme } = useTheme();
  const notify = useNotify();

  const [document, setDocument] = useState<PleadingDocument>(initialDoc);
  const sectionSelection = useSingleSelection<PleadingSection>(null, (a, b) => a.id === b.id);
  const [viewMode, setViewMode] = useState<ViewMode>('write');
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Data Fetching
  const { data: formattingRules, isLoading: rulesLoading, error: rulesError, refetch: refetchRules } = useQuery<FormattingRule>(
    ['format_rules', document.jurisdictionRulesId],
    () => DataService.pleadings.getFormattingRules()
  );
  
  const { data: caseData, isLoading: caseLoading, error: caseError, refetch: refetchCase } = useQuery<Case | undefined>(
      ['cases', document.caseId],
      () => DataService.cases.getById(document.caseId)
  );

  // History management for undo/redo
  const history = useHistory({
    initialState: document,
    maxHistory: 50,
    onStateChange: useCallback((newState: PleadingDocument) => {
      setDocument(newState);
    }, [])
  });

  // Auto-save with race condition prevention
  const { forceSave, isSaving } = useAutoSave({
    data: document,
    onSave: useCallback(async (doc: PleadingDocument) => {
      try {
        await DataService.pleadings.update(doc.id, doc);
        queryClient.invalidate(queryKeys.pleadings.byCaseId(doc.caseId));
        setSaveError(null);
      } catch (error) {
        if (error instanceof VersionConflictError) {
          setSaveError('Document was modified by another user. Please refresh.');
          throw error;
        }
        throw error;
      }
    }, []),
    delay: 2000,
    onSuccess: () => notify.success("Document auto-saved."),
    onError: (error) => {
      notify.error("Save failed: " + error.message);
      setSaveError(error.message);
    }
  });

  const handleUpdateSection = useCallback((id: string, updates: Partial<PleadingSection>) => {
    history.execute({
      execute: (state) => ({
        ...state,
        sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s),
        updatedAt: new Date().toISOString()
      }),
      undo: (state) => ({
        ...state,
        sections: document.sections
      }),
      description: `Update section ${id}`
    });
  }, [history, document.sections]);

  const handleInsertText = (text: string) => {
      if (sectionSelection.selected) {
          const section = document.sections.find(s => s.id === sectionSelection.selected?.id);
          if (section) handleUpdateSection(sectionSelection.selected.id, { content: section.content + '\n\n' + text });
      }
  };

  if (rulesLoading || caseLoading) return <LazyLoader message="Loading Designer Environment..."/>;
  if (rulesError) return <ErrorState message="Failed to load formatting rules" onRetry={refetchRules} />;
  if (caseError) return <ErrorState message="Failed to load case data" onRetry={refetchCase} />;
  if (!formattingRules) return <LazyLoader message="Loading formatting rules..."/>;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Top Toolbar */}
      <div className={cn("h-16 border-b flex justify-between items-center px-4 shrink-0 z-20", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to Workspace</Button>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
          <h2 className={cn("font-bold", theme.text.primary)}>{document.title}</h2>
          {saveError && (
            <span className="text-xs text-rose-600 font-medium">{saveError}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              icon={Undo2} 
              onClick={history.undo} 
              disabled={!history.canUndo}
              title="Undo"
            />
            <Button 
              variant="ghost" 
              icon={Redo2} 
              onClick={history.redo} 
              disabled={!history.canRedo}
              title="Redo"
            />
          </div>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
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
          <Button variant="primary" icon={Save} onClick={forceSave} isLoading={isSaving}>Save</Button>
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
            <PleadingPaper rules={formattingRules}>
                <PleadingCanvas
                    document={document}
                    rules={formattingRules}
                    readOnly={viewMode === 'preview'}
                    viewMode={viewMode}
                    onUpdateSection={handleUpdateSection}
                    relatedCase={caseData}
                />
                {viewMode === 'logic' && <LogicOverlay document={document} />}
            </PleadingPaper>
            <ComplianceHUD rules={formattingRules} sections={document.sections} score={100}/>
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


