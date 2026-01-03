/**
 * CaseDrafting.tsx
 * 
 * AI-assisted document drafting interface with clause library integration,
 * history tracking, and Gemini-powered generation.
 * 
 * @module components/case-detail/CaseDrafting
 * @category Case Management - Document Drafting
 */

// External Dependencies
import React, { useState, useEffect } from 'react';
import { Cpu, AlertTriangle, Wand2 } from 'lucide-react';

// Internal Dependencies - Components
import { AdvancedEditor } from '@features/operations';
import { ClauseList as ClausePanel } from '@features/knowledge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers';

// Internal Dependencies - Services & Utils
import { GeminiService } from '@/services/features/research/geminiService';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Clause } from '@/types';

interface CaseDraftingProps {
  caseTitle: string;
  draftPrompt: string;
  setDraftPrompt: (s: string) => void;
  draftResult: string;
  isDrafting: boolean;
  onDraft: () => void;
}

export const CaseDrafting: React.FC<CaseDraftingProps> = ({
  caseTitle,
  draftPrompt,
  setDraftPrompt,
  draftResult,
  isDrafting,
  onDraft
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [reviewResult, setReviewResult] = useState('');
  const [activeMode, setActiveMode] = useState<'edit' | 'review'>('edit');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (draftResult) {
      // Ensure paragraphs are properly separated if AI returns blocks
      const formatted = draftResult.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>');
      setContent(prev => prev + `<p>${formatted}</p>`);
    }
  }, [draftResult]);

  const handleReview = async () => {
    if(!content) return;
    setLoading(true);
    setActiveMode('review');
    // Safe text extraction replacing block tags with newlines to preserve spacing for AI context
    const plainText = content
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, ''); // Strip remaining tags
        
    const res = await GeminiService.reviewContract(plainText);
    setReviewResult(res);
    setLoading(false);
  };

  const insertClause = (c: Clause) => {
    const clauseHtml = `<p><strong>[${c.name}]:</strong> ${c.content}</p>`;
    setContent(prev => prev + clauseHtml);
  };

  const handleAiAssist = () => {
    setDraftPrompt(`For the case "${caseTitle}", draft a standard motion to compel discovery regarding ...`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full relative">
      <div className="lg:col-span-2 flex flex-col h-full space-y-4">
        <div className={cn("p-2 rounded-lg border shadow-sm flex gap-2 items-center", theme.surface.default, theme.border.default)}>
             <button onClick={handleAiAssist} className={cn("p-2 rounded-md transition-colors", theme.surface.highlight, theme.action.primary.text, `hover:${theme.surface.active}`)} title="AI Assist">
                <Wand2 className={cn("h-5 w-5", theme.action.primary.text)}/>
             </button>
             <input
                value={draftPrompt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onDraft()}
                placeholder="Describe a clause or section to draft (e.g. 'Force Majeure for a pandemic')..."
                className={cn("flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400", theme.text.primary)}
            />
            <button
                onClick={onDraft}
                disabled={isDrafting || !draftPrompt}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
                {isDrafting ? 'Generating...' : 'Generate Draft'}
            </button>
        </div>

        <AdvancedEditor
          key={content.length}
          initialContent={content}
          onSave={(newHtml) => {
            setContent(newHtml);
            alert('Document saved to case file.');
          }}
          placeholder="Begin drafting your legal document here..."
        />
      </div>

      <div className={cn("rounded-lg shadow-sm border overflow-hidden flex flex-col h-full", theme.surface.default, theme.border.default)}>
        <div className={cn("flex border-b", theme.border.subtle)}>
          <button
            onClick={() => setActiveMode('edit')}
            className={cn("flex-1 py-3 text-sm font-medium", activeMode !== 'review' ? cn(theme.text.link, "border-b-2", theme.action.primary.border, theme.surface.highlight) : cn(theme.text.secondary, `hover:${theme.surface.highlight}`))}
          >
            Clause Library
          </button>
          <button
            onClick={() => setActiveMode('review')}
            className={cn("flex-1 py-3 text-sm font-medium", activeMode === 'review' ? cn(theme.status.warning.text, "border-b-2", theme.status.warning.border, theme.surface.highlight) : cn(theme.text.secondary, `hover:${theme.surface.highlight}`))}
          >
            Risk Analysis
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto flex flex-col", theme.surface.highlight)}>
          {activeMode === 'review' ? (
             <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 shrink-0 mt-0.5"/>
                    <p>AI Analysis detects potential risks. Review suggestions carefully.</p>
                </div>
                {loading ? (
                    <div className={cn("flex flex-col items-center justify-center py-12", theme.text.tertiary)}>
                        <Cpu className="h-8 w-8 animate-spin mb-2"/>
                        <span className="text-xs">Analyzing contract structure...</span>
                    </div>
                ) : (
                    <div className={cn("prose prose-sm leading-relaxed whitespace-pre-wrap", theme.text.secondary)}>
                        {reviewResult || (
                            <div className={cn("text-center py-8 italic", theme.text.tertiary)}>
                                Click "Review Risks" to analyze the current document content.
                                <button onClick={handleReview} className={cn("mt-4 px-4 py-2 border rounded shadow-sm block mx-auto transition-colors", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)}>Run Analysis</button>
                            </div>
                        )}
                    </div>
                )}
             </div>
          ) : (
            <ClausePanel onSelectClause={insertClause} />
          )}
        </div>
      </div>
    </div>
  );
};


