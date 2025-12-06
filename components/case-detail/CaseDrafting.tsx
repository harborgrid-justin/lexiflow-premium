import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Book, AlertTriangle, Check, Wand2, Search, History, Loader2 } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';
import { Clause } from '../../types';
import { AdvancedEditor } from '../AdvancedEditor';
import { DataService } from '../../services/dataService';
import { ClauseHistoryModal } from '../ClauseHistoryModal';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

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
  const [activeMode, setActiveMode] = useState<'edit' | 'review' | 'clauses'>('edit');
  const [loading, setLoading] = useState(false);
  
  // Enterprise Data Access
  const { data: clauses = [], isLoading: loadingClauses } = useQuery<Clause[]>(
      [STORES.CLAUSES, 'all'],
      DataService.clauses.getAll
  );
  
  // Clause Library State
  const [clauseSearch, setClauseSearch] = useState('');
  const [selectedClauseHistory, setSelectedClauseHistory] = useState<Clause | null>(null);

  useEffect(() => {
    if (draftResult) {
      setContent(prev => prev + `<p>${draftResult.replace(/\n/g, '<br/>')}</p>`);
    }
  }, [draftResult]);

  const filteredClauses = useMemo(() => {
    return clauses.filter(c => 
      c.name.toLowerCase().includes(clauseSearch.toLowerCase()) || 
      c.content.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(clauseSearch.toLowerCase())
    );
  }, [clauseSearch, clauses]);

  const handleReview = async () => {
    if(!content) return;
    setLoading(true);
    setActiveMode('review');
    const plainText = content.replace(/<[^>]*>?/gm, '');
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
      {selectedClauseHistory && (
        <ClauseHistoryModal clause={selectedClauseHistory} onClose={() => setSelectedClauseHistory(null)} />
      )}

      <div className="lg:col-span-2 flex flex-col h-full space-y-4">
        <div className={cn("p-2 rounded-lg border shadow-sm flex gap-2 items-center", theme.surface, theme.border.default)}>
             <button onClick={handleAiAssist} className="bg-purple-100 p-2 rounded-md hover:bg-purple-200 transition-colors" title="AI Assist">
                <Wand2 className="h-5 w-5 text-purple-600"/>
             </button>
             <input 
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
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
      
      <div className={cn("rounded-lg shadow-sm border overflow-hidden flex flex-col h-full", theme.surface, theme.border.default)}>
        <div className={cn("flex border-b", theme.border.light)}>
          <button 
            onClick={() => setActiveMode('edit')} 
            className={`flex-1 py-3 text-sm font-medium ${activeMode !== 'review' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)}`}
          >
            Clause Library
          </button>
          <button 
            onClick={() => setActiveMode('review')} 
            className={`flex-1 py-3 text-sm font-medium ${activeMode === 'review' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/20' : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)}`}
          >
            Risk Analysis
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto flex flex-col", theme.surfaceHighlight)}>
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
                                <button onClick={handleReview} className={cn("mt-4 px-4 py-2 border rounded shadow-sm block mx-auto transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>Run Analysis</button>
                            </div>
                        )}
                    </div>
                )}
             </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Search Bar */}
              <div className={cn("p-3 border-b sticky top-0 z-10", theme.surface, theme.border.light)}>
                <div className="relative">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
                    <input 
                        className={cn("w-full pl-9 pr-3 py-2 text-sm border rounded-md outline-none transition-all focus:ring-1 focus:ring-blue-500", theme.surface, theme.border.default, theme.text.primary)}
                        placeholder="Search clauses..."
                        value={clauseSearch}
                        onChange={(e) => setClauseSearch(e.target.value)}
                    />
                </div>
              </div>

              {/* Clause List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="flex justify-between items-center mb-2 px-1">
                    <p className={cn("text-xs font-medium uppercase tracking-wider", theme.text.tertiary)}>Available ({filteredClauses.length})</p>
                </div>
                
                {loadingClauses ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-600"/></div> : filteredClauses.map(c => (
                  <div 
                      key={c.id} 
                      className={cn("p-3 border rounded-lg hover:shadow-md transition-all group relative cursor-pointer", theme.surface, theme.border.default, `hover:${theme.primary.border}`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex-1" onClick={() => insertClause(c)}>
                            <span className={cn("font-bold text-xs flex items-center gap-1.5", theme.text.primary)}>
                                <Book className={cn("h-3 w-3", theme.text.tertiary)}/> {c.name}
                            </span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border mt-1.5 inline-block", theme.surfaceHighlight, theme.text.secondary, theme.border.default)}>{c.category}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedClauseHistory(c); }}
                            className={cn("p-1.5 rounded-md transition-colors", theme.text.tertiary, `hover:${theme.primary.text}`, `hover:${theme.surfaceHighlight}`)}
                            title="View Version History"
                        >
                            <History className="h-3.5 w-3.5"/>
                        </button>
                    </div>
                    <div onClick={() => insertClause(c)}>
                        <p className={cn("text-xs line-clamp-3 italic font-serif mt-1 leading-relaxed border-l-2 pl-2", theme.text.secondary, theme.border.light)}>
                            "{c.content}"
                        </p>
                        <div className="mt-2 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                            <Check className="h-3 w-3 mr-1"/> Insert Clause
                        </div>
                    </div>
                  </div>
                ))}
                
                {filteredClauses.length === 0 && (
                    <div className={cn("text-center py-8 text-xs", theme.text.tertiary)}>
                        <p>No clauses found matching "{clauseSearch}"</p>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};