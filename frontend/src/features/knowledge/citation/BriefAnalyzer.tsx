/**
 * BriefAnalyzer.tsx
 * 
 * AI-powered brief analysis tool using Google Gemini for citation validation,
 * argument strength assessment, and counter-argument identification.
 * 
 * @module components/citation/BriefAnalyzer
 * @category Legal Research - AI Analysis
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo } from 'react';
import { 
  FileText, Loader2, BrainCircuit, 
  Scale, Network, Save, ExternalLink
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Tabs } from '@/components/molecules/Tabs';
import { RiskMeter } from '@/components/organisms/RiskMeter';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers/WindowContext';

// Services & Utils
import { DataService } from '@/services';
import { GeminiService, BriefCritique } from '@/services/features/research/geminiService';
import { AnalysisEngine, ConflictResult } from '@/services/features/analysis/analysisEngine';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Citation, Case } from '@/types';
import { sanitizeHtml } from './utils';

export const BriefAnalyzer: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { openWindow, closeWindow: _closeWindow } = useWindow();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'authority' | 'strategy' | 'nexus'>('authority');
  
  // Results State
  const [extractedCitations, setExtractedCitations] = useState<string[]>([]);
  const [critique, setCritique] = useState<BriefCritique | null>(null);
  const [conflicts, setConflicts] = useState<ConflictResult[]>([]);

  // Load Data Dependencies
  const { data: authorityDb = [] } = useQuery<Citation[]>(['citations', 'all'], () => DataService.citations.getAll());
  const { data: allCases = [] } = useQuery<Case[]>(['cases', 'all'], () => DataService.cases.getAll());

  // Mutations
  const { mutate: _addToLibrary } = useMutation(
      DataService.citations.quickAdd,
      {
          onSuccess: (citation) => {
              const cite = citation as Citation;
              notify.success(`Added ${cite.citation} to Library`);
          }
      }
  );

  const { mutate: saveSession, isLoading: isSaving } = useMutation(
      DataService.analysis.add,
      {
          onSuccess: () => notify.success("Analysis session saved to case file.")
      }
  );

  const handleAnalyze = async () => {
      if (!text.trim()) return;
      setIsAnalyzing(true);
      setActiveTab('authority'); // Reset tab

      try {
          // 1. Local Analysis (Fast)
          const cites = AnalysisEngine.extractCitations(text);
          setExtractedCitations(cites);

          const nexus = AnalysisEngine.scanForInternalNexus(text, allCases);
          setConflicts(nexus);

          // 2. AI Analysis (Slow)
          const aiResult = await GeminiService.critiqueBrief(text);
          setCritique(aiResult);
          
          if (aiResult.score) {
              setActiveTab('strategy'); // Switch to strategy if we got a good result
          }

      } catch (e) {
          console.error("Analysis failed", e);
          notify.error("Analysis failed to complete.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleDetachReport = () => {
      if (!critique) return;
      const winId = `analysis-${Date.now()}`;
      openWindow(
          winId,
          'Brief Analysis Report',
          <div className="p-6 bg-white h-full overflow-y-auto">
              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                  <div>
                      <h2 className="text-2xl font-bold">AI Critique Results</h2>
                      <p className="text-sm text-slate-500">Generated on {new Date().toLocaleString()}</p>
                  </div>
                  <button 
                      onClick={() => handleCloseAnalysisWindow(winId)}
                      className="text-slate-400 hover:text-slate-600"
                  >
                      ✕
                  </button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                  <Card title="Strength Score">
                      <RiskMeter value={critique.score} type="strength" />
                  </Card>
                  <Card title="Key Weaknesses">
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                          {critique.weaknesses.map((w, i) => <li key={i} className="text-red-700">{w}</li>)}
                      </ul>
                  </Card>
              </div>
              <Card title="Recommendations">
                   <ul className="list-disc pl-5 space-y-1 text-sm">
                       {critique.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                   </ul>
              </Card>
          </div>
      );
  };

  const matchedAuthorities = useMemo(() => {
      return extractedCitations.map(citeText => {
          const match = authorityDb.find(dbCite => 
              citeText.includes(dbCite.citation) || dbCite.citation.includes(citeText)
          );
          return { 
              text: citeText, 
              match 
          };
      });
  }, [extractedCitations, authorityDb]);

  // Cleanup function for closing windows
  const handleCloseAnalysisWindow = (windowId: string) => {
      _closeWindow(windowId);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-fade-in">
        {/* Left Pane: Editor / Input */}
        <div className={cn("flex-1 flex flex-col min-h-[500px] rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                <h3 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                    <FileText className="h-4 w-4 mr-2 text-blue-600"/> Brief Editor
                </h3>
                <span className={cn("text-xs font-mono", theme.text.tertiary)}>{text.length} chars</span>
            </div>
            <textarea 
                className={cn("flex-1 w-full p-6 font-serif text-base leading-relaxed outline-none resize-none", theme.text.primary, theme.surface.input)}
                placeholder="Paste your brief, motion, or opposing counsel's filing here for analysis..."
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            />
            <div className={cn("p-4 border-t flex justify-between", theme.border.default, theme.surface.highlight)}>
                 <div className="flex gap-2">
                     {critique && (
                         <>
                            <Button variant="secondary" size="sm" icon={Save} onClick={() => saveSession({
                                id: `ans-${Date.now()}`,
                                textSnapshot: sanitizeHtml(text.substring(0, 1000)),
                                extractedCitations,
                                riskScore: 100 - critique.score,
                                strengths: critique.strengths,
                                weaknesses: critique.weaknesses,
                                suggestions: critique.suggestions,
                                missingAuthority: critique.missingAuthority,
                                timestamp: new Date().toISOString()
                            })} isLoading={isSaving}>
                                Save Report
                            </Button>
                            <Button variant="outline" size="sm" icon={ExternalLink} onClick={handleDetachReport}>
                                Pop Out
                            </Button>
                         </>
                     )}
                 </div>
                <Button 
                    variant="primary" 
                    icon={isAnalyzing ? Loader2 : BrainCircuit} 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !text}
                    className="w-full md:w-auto"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis Engine'}
                </Button>
            </div>
        </div>

        {/* Right Pane: Intelligence Hub */}
        <div className={cn("w-full lg:w-[450px] flex flex-col rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
             <div className={cn("px-4 pt-4 border-b", theme.border.subtle)}>
                 <Tabs 
                    tabs={[
                        { id: 'authority', label: 'Authority', icon: Scale },
                        { id: 'strategy', label: 'Strategy', icon: BrainCircuit },
                        { id: 'nexus', label: 'Nexus', icon: Network }
                    ]}
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t as 'authority' | 'strategy' | 'nexus')}
                    variant="underline"
                    className="border-none"
                 />
             </div>

             <div className={cn("flex-1 overflow-y-auto p-6", theme.surface.highlight)}>
                 {!critique && !isAnalyzing && extractedCitations.length === 0 && (
                     <div className={cn("flex flex-col items-center justify-center h-full text-center p-8", theme.text.tertiary)}>
                         <BrainCircuit className="h-16 w-16 mb-4 opacity-20"/>
                         <p className="text-sm font-medium">Ready to Analyze</p>
                         <p className="text-xs mt-2">AI will extract citations, check signals, and critique arguments.</p>
                     </div>
                 )}
                 
                 {/* Authority Tab Content */}
                 {activeTab === 'authority' && matchedAuthorities.length > 0 && (
                     <div className="space-y-4">
                         <h4 className={cn("font-semibold text-sm", theme.text.primary)}>Citation Verification</h4>
                         {matchedAuthorities.map((item, idx) => (
                             <Card key={idx} className="p-3">
                                 <div className="flex justify-between items-start gap-2">
                                     <div className="flex-1">
                                         <p className={cn("text-sm font-mono", theme.text.secondary)}>{item.text}</p>
                                         {item.match ? (
                                             <div className={cn("mt-2 text-xs", theme.status.success.text)}>
                                                 ✓ Verified in database: {item.match.signal || 'N/A'}
                                             </div>
                                         ) : (
                                             <div className={cn("mt-2 text-xs", theme.status.warning.text)}>
                                                 ⚠ Not found in citation database
                                             </div>
                                         )}
                                     </div>
                                     {!item.match && (
                                         <Button 
                                             size="sm" 
                                             variant="outline"
                                             onClick={() => _addToLibrary({ 
                                                 id: `cite-${Date.now()}-${idx}`,
                                                 citation: item.text,
                                                 signal: 'unknown',
                                                 createdAt: new Date().toISOString(),
                                                 updatedAt: new Date().toISOString(),
                                                 userId: 'current-user' as any
                                             })}
                                         >
                                             Add to Library
                                         </Button>
                                     )}
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
                 
                 {/* Strategy Tab Content */}
                 {activeTab === 'strategy' && critique && (
                     <div className="space-y-4">
                         <Card title="Strength Assessment">
                             <RiskMeter value={critique.score} type="strength" />
                         </Card>
                         <Card title="Strengths">
                             <ul className={cn("list-disc pl-5 space-y-1 text-sm", theme.status.success.text)}>
                                 {critique.strengths.map((s, i) => <li key={i}>{s}</li>)}
                             </ul>
                         </Card>
                         <Card title="Weaknesses">
                             <ul className={cn("list-disc pl-5 space-y-1 text-sm", theme.status.error.text)}>
                                 {critique.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                             </ul>
                         </Card>
                         <Card title="Recommendations">
                             <ul className={cn("list-disc pl-5 space-y-1 text-sm", theme.text.secondary)}>
                                 {critique.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                             </ul>
                         </Card>
                     </div>
                 )}
                 
                 {/* Nexus Tab Content */}
                 {activeTab === 'nexus' && conflicts.length > 0 && (
                     <div className="space-y-4">
                         <h4 className={cn("font-semibold text-sm", theme.text.primary)}>Internal Case Conflicts</h4>
                         {conflicts.map((conflict, idx) => (
                             <Card key={idx} className="p-3">
                                 <div className={cn("text-sm font-semibold mb-1", theme.status.warning.text)}>
                                     {conflict.type === 'client' ? 'Client Conflict' : 
                                      conflict.type === 'party' ? 'Party Conflict' : 'Position Conflict'}
                                 </div>
                                 <p className={cn("text-xs", theme.text.secondary)}>{conflict.description}</p>
                                 <p className={cn("text-xs mt-2", theme.text.tertiary)}>Risk: {conflict.severity}</p>
                             </Card>
                         ))}
                     </div>
                 )}
             </div>
        </div>
    </div>
  );
};

export default BriefAnalyzer;


