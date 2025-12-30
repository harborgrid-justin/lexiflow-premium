/**
 * CitationDetail.tsx
 * 
 * Detailed citation view with AI-powered analysis, Shepardization status,
 * and linked cases. Shows treatment history and citing authority strength.
 * 
 * @module components/citation/CitationDetail
 * @category Legal Research - Citation Details
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, CheckCircle, AlertTriangle, Link, Wand2, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/atoms';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services';
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/utils/cn';
import { sanitizeHtml } from '@/utils/sanitize';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '@/types';
import { CitationDetailProps } from './types';

export const CitationDetail: React.FC<CitationDetailProps> = ({ citation, onClose }) => {
  const { theme } = useTheme();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Enterprise Data Access
  const { data: linkedCases = [], isLoading } = useQuery<Case[]>(
      ['cases', 'citation_link', citation.id],
      async () => {
          // Mock Relational Logic: In real app would query case_citations junction
          const allCases = await DataService.cases.getAll();
          // Return random subset for demo visualization
          return allCases.slice(0, 2);
      }
  );

  const handleAIAnalysis = async () => {
      setAnalyzing(true);
      try {
          const result = await GeminiService.generateDraft(
            `Summarize the legal significance of ${citation.title} (${citation.citation}). Explain its relevance to modern ${citation.type} litigation.`,
            'Legal Summary'
          );
          setAiAnalysis(result);
      } finally {
          setAnalyzing(false);
      }
  };

  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl animate-in slide-in-from-right duration-300 z-10", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>Authority Detail</h4>
            <button title="Close panel" onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}><X className="h-4 w-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div className={cn("text-xs font-mono px-2 py-1 rounded border font-bold", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                        {citation.citation}
                    </div>
                    <div className={cn("flex items-center text-xs font-bold px-2 py-1 rounded border", citation.shepardsSignal === 'Positive' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                        {citation.shepardsSignal === 'Positive' ? <CheckCircle className="h-3 w-3 mr-1"/> : <AlertTriangle className="h-3 w-3 mr-1"/>}
                        {citation.shepardsSignal}
                    </div>
                </div>
                <h3 className={cn("text-lg font-bold leading-snug", theme.text.primary)}>{citation.title}</h3>
                <p className={cn("text-sm mt-2 leading-relaxed", theme.text.secondary)}>{citation.description}</p>
            </div>

            <div className="space-y-3">
                <h4 className={cn("text-xs font-bold uppercase border-b pb-2", theme.text.tertiary, theme.border.default)}>Referencing Cases</h4>
                {isLoading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin h-5 w-5 mx-auto text-slate-400"/></div>
                ) : linkedCases.map(c => (
                    <div key={c.id} className={cn("p-3 rounded border flex items-center justify-between group cursor-pointer transition-colors", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-blue-100 p-1.5 rounded text-blue-600 shrink-0"><BookOpen className="h-4 w-4"/></div>
                            <div className="min-w-0">
                                <p className={cn("text-sm font-bold truncate", theme.text.primary)}>{c.title}</p>
                                <p className={cn("text-xs truncate", theme.text.secondary)}>{c.id}</p>
                            </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100"/>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className={cn("flex justify-between items-center border-b pb-2", theme.border.default)}>
                    <h4 className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>AI Analysis</h4>
                    <button 
                        onClick={handleAIAnalysis} 
                        disabled={analyzing}
                        className="text-xs flex items-center text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                    >
                        {analyzing ? 'Thinking...' : <><Wand2 className="h-3 w-3 mr-1"/> Summarize</>}
                    </button>
                </div>
                {aiAnalysis ? (
                    <div className={cn("text-sm p-3 bg-purple-50 border border-purple-100 rounded text-slate-800 leading-relaxed")}>
                        <div dangerouslySetInnerHTML={{__html: sanitizeHtml(aiAnalysis)}} />
                    </div>
                ) : (
                    <div className={cn("text-center py-6 text-xs italic", theme.text.tertiary)}>
                        Click Summarize to generate an AI brief of this authority.
                    </div>
                )}
            </div>
        </div>

        <div className={cn("p-4 border-t flex gap-2", theme.surface.highlight, theme.border.default)}>
            <Button variant="outline" className="flex-1" icon={Link}>Copy Cite</Button>
            <Button variant="primary" className="flex-1">Add to Brief</Button>
        </div>
    </div>
  );
};


