
import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { PenTool, Cpu, Book, AlertTriangle, Check, Wand2, Search, History, Bold, Italic, List, AlignLeft, Download } from 'lucide-react';
import { GeminiService } from '../../services/geminiService.ts';
import { Clause } from '../../types.ts';
import { AdvancedEditor } from '../AdvancedEditor.tsx';
import { MOCK_CLAUSES } from '../../data/mockClauses.ts';
import { ClauseHistoryModal } from '../ClauseHistoryModal.tsx';

interface CaseDraftingProps {
  caseTitle: string;
  draftPrompt: string;
  setDraftPrompt: (s: string) => void;
  draftResult: string;
  isDrafting: boolean;
  onDraft: () => void;
}

export const CaseDrafting: React.FC<CaseDraftingProps> = ({ 
  caseTitle, draftPrompt, setDraftPrompt, draftResult, isDrafting, onDraft
}) => {
  const [content, setContent] = useState('');
  const [reviewResult, setReviewResult] = useState('');
  const [activeMode, setActiveMode] = useState<'edit' | 'review' | 'clauses'>('edit');
  const [loading, setLoading] = useState(false);
  
  // Clause Library State
  const [clauseSearch, setClauseSearch] = useState('');
  // Guideline 4: Defer search term
  const deferredClauseSearch = useDeferredValue(clauseSearch);
  
  const [selectedClauseHistory, setSelectedClauseHistory] = useState<Clause | null>(null);

  useEffect(() => {
    if (draftResult) {
      setContent(prev => prev + `<p>${draftResult.replace(/\n/g, '<br/>')}</p>`);
    }
  }, [draftResult]);

  const filteredClauses = useMemo(() => {
    return MOCK_CLAUSES.filter(c => 
      c.name.toLowerCase().includes(deferredClauseSearch.toLowerCase()) || 
      c.content.toLowerCase().includes(deferredClauseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(deferredClauseSearch.toLowerCase())
    );
  }, [deferredClauseSearch]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full relative">
      {selectedClauseHistory && (
        <ClauseHistoryModal clause={selectedClauseHistory} onClose={() => setSelectedClauseHistory(null)} />
      )}

      <div className="lg:col-span-2 flex flex-col h-full space-y-4">
        {/* AI Prompt Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center ring-1 ring-slate-100">
             <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg text-white shadow-sm shrink-0">
                 <Wand2 className="h-5 w-5"/>
             </div>
             <input 
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onDraft()}
                placeholder="Describe a clause to draft (e.g. 'Force Majeure with pandemic inclusion')..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400"
            />
            <button 
                onClick={onDraft} 
                disabled={isDrafting || !draftPrompt} 
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
                {isDrafting ? 'Generating...' : 'Draft'}
            </button>
        </div>

        {/* Editor Container */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Custom Toolbar Overlay on AdvancedEditor */}
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
      </div>
      
      {/* Sidebar Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button 
            onClick={() => setActiveMode('edit')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeMode !== 'review' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setActiveMode('review')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeMode === 'review' ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            AI Review
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 flex flex-col">
          {activeMode === 'review' ? (
             <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start shadow-sm">
                    <AlertTriangle className="h-4 w-4 mr-2 shrink-0 mt-0.5"/>
                    <p>AI Analysis detects potential risks in the current text. Review suggestions carefully before finalizing.</p>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Cpu className="h-8 w-8 animate-spin mb-2"/>
                        <span className="text-xs font-medium">Analyzing contract structure...</span>
                    </div>
                ) : (
                    <div className="prose prose-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-serif">
                        {reviewResult || (
                            <div className="text-center py-12 text-slate-400 italic">
                                <p className="mb-4 text-xs">No active analysis.</p>
                                <button onClick={handleReview} className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-xs font-bold transition-colors">Run Risk Analysis</button>
                            </div>
                        )}
                    </div>
                )}
             </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
                    <input 
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="Search clauses..."
                        value={clauseSearch}
                        onChange={(e) => setClauseSearch(e.target.value)}
                    />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredClauses.map(c => (
                  <div 
                      key={c.id} 
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group relative cursor-pointer"
                      onClick={() => insertClause(c)}
                  >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <Book className="h-3 w-3 text-slate-400"/> {c.name}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 mt-1 inline-block uppercase tracking-wide font-bold">{c.category}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedClauseHistory(c); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            <History className="h-3.5 w-3.5"/>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 italic font-serif leading-relaxed border-l-2 border-slate-100 pl-2 group-hover:border-blue-200 transition-colors">
                        "{c.content}"
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <span className="text-xs font-bold text-blue-600 flex items-center"><Check className="h-3 w-3 mr-1"/> Insert Clause</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
