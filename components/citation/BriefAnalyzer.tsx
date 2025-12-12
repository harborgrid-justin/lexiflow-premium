
import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Loader2, BrainCircuit, ShieldAlert, CheckCircle2, 
  AlertTriangle, Scale, BookOpen, ArrowRight, Network, Plus, Save, ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tabs } from '../common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { GeminiService, BriefCritique } from '../../services/geminiService';
import { AnalysisEngine } from '../../services/analysisEngine';
import { Citation, Case, BriefAnalysisSession } from '../../types';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { RiskMeter } from '../common/RiskMeter';
import { useNotify } from '../../hooks/useNotify';
import { useWindow } from '../../context/WindowContext';

// Simple sanitizer to strip script tags
const sanitizeHtml = (html: string) => {
    return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
               .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
               .replace(/on\w+="[^"]*"/g, "");
};

export const BriefAnalyzer: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'authority' | 'strategy' | 'nexus'>('authority');
  
  // Results State
  const [extractedCitations, setExtractedCitations] = useState<string[]>([]);
  const [critique, setCritique] = useState<BriefCritique | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Load Data Dependencies
  const { data: authorityDb = [] } = useQuery<Citation[]>([STORES.CITATIONS, 'all'], DataService.citations.getAll);
  const { data: allCases = [] } = useQuery<Case[]>([STORES.CASES, 'all'], DataService.cases.getAll);

  // Mutations
  const { mutate: addToLibrary } = useMutation(
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
              <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold">AI Critique Results</h2>
                  <p className="text-sm text-slate-500">Generated on {new Date().toLocaleString()}</p>
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
                onChange={(e) => setText(e.target.value)}
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
                    onChange={(t) => setActiveTab(t as any)}
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
                 {/* ... existing result rendering ... */}
             </div>
        </div>
    </div>
  );
};
