/**
 * ArgumentDetail.tsx
 *
 * Detailed argument editor with tabs for core info, authorities, evidence,
 * and AI-powered analysis using Gemini.
 *
 * @module components/case-detail/arguments/ArgumentDetail
 * @category Case Management - Arguments
 */

// External Dependencies
import React, { useState } from 'react';
import { X, Save, Trash2, Wand2, Plus, Fingerprint, Scale, AlertTriangle } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { Input } from '@/components/ui/atoms/Input';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';
import { ArgumentCoreInfo } from './ArgumentCoreInfo';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers';

// Internal Dependencies - Services & Utils
import { generateDraft } from '@/app/actions/ai/gemini';
import { cn } from '@/utils/cn';

// Types & Interfaces
import { LegalArgument, EvidenceItem, Citation, EvidenceId } from '@/types';

interface ArgumentDetailProps {
  argument: LegalArgument;
  onUpdate: (arg: LegalArgument) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  allEvidence: EvidenceItem[];
  allCitations: Citation[];
}

export const ArgumentDetail: React.FC<ArgumentDetailProps> = ({
  argument, onUpdate, onDelete, onClose, allEvidence, allCitations
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'core' | 'authority' | 'evidence' | 'analysis'>('core');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const [isLinkingEvidence, setIsLinkingEvidence] = useState(false);
  const [isLinkingCitation, setIsLinkingCitation] = useState(false);

  const handleAnalyze = async () => {
      setIsAnalyzing(true);
      setActiveTab('analysis');
      const prompt = `Analyze this legal argument for weaknesses and suggest counter-arguments: "${argument.title}: ${argument.description}"`;
      const result = await GeminiService.generateDraft(prompt, 'Analysis');
      setAiAnalysis(result);
      setIsAnalyzing(false);
  };

  const toggleLink = (id: string, type: 'evidence' | 'citation') => {
      if (type === 'evidence') {
          const key = 'relatedEvidenceIds';
          const current = argument[key] || [];
          const typedId = id as EvidenceId;
          const updated = current.includes(typedId)
              ? current.filter((i: EvidenceId) => i !== typedId)
              : [...current, typedId];
          onUpdate({ ...argument, [key]: updated });
      } else {
          const key = 'relatedCitationIds';
          const current = argument[key] || [];
          const updated = current.includes(id)
              ? current.filter((i: string) => i !== id)
              : [...current, id];
          onUpdate({ ...argument, [key]: updated });
      }
  };

  return (
    <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn("p-5 border-b flex justify-between items-start", theme.surface.highlight, theme.border.default)}>
            <div className="flex-1 mr-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-xs font-mono border px-1.5 rounded", theme.text.tertiary, theme.border.default)}>ID: {argument.id.slice(-6)}</span>
                    <Badge variant={argument.status === 'Active' ? 'success' : 'warning'}>{argument.status}</Badge>
                </div>
                <Input
                    value={argument.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...argument, title: e.target.value })}
                    className={cn("text-lg font-bold border-transparent bg-transparent px-2 -ml-2 transition-all", theme.text.primary, `hover:${theme.surface.default}`, `hover:${theme.border.default}`, `focus:${theme.surface.default}`, `focus:${theme.border.default}`)}
                />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onClose} title="Close argument" className={cn("p-2 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
                    <X className="h-5 w-5"/>
                </button>
            </div>
        </div>

        <div className={cn("px-4 border-b", theme.border.default)}>
            <Tabs
                tabs={['core', 'authority', 'evidence', 'analysis']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as 'core' | 'authority' | 'evidence' | 'analysis')}
                variant="underline"
            />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'core' && (
                <ArgumentCoreInfo argument={argument} onUpdate={onUpdate} onAnalyze={handleAnalyze} />
            )}

            {activeTab === 'authority' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className={cn("text-sm font-bold uppercase", theme.text.secondary)}>Linked Citations ({argument.relatedCitationIds.length})</h4>
                        <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsLinkingCitation(!isLinkingCitation)}>
                            {isLinkingCitation ? 'Done' : 'Link Authority'}
                        </Button>
                    </div>

                    {isLinkingCitation && (
                        <div className={cn("p-3 rounded-lg border mb-4 max-h-48 overflow-y-auto", theme.surface.highlight, theme.border.default)}>
                            {allCitations.map(cit => (
                                <div key={cit.id} onClick={() => toggleLink(cit.id, 'citation')} className={cn("flex items-center p-2 rounded cursor-pointer transition-colors", argument.relatedCitationIds.includes(cit.id as string) ? theme.surface.highlight : `hover:${theme.surface.default}`)}>
                                    <div className={cn("w-4 h-4 border rounded mr-3 flex items-center justify-center", theme.surface.default, argument.relatedCitationIds.includes(cit.id as string) ? theme.action.primary.border : theme.border.default)}>
                                        {argument.relatedCitationIds.includes(cit.id as string) && <div className={cn("w-2 h-2 rounded-full", theme.action.primary.bg)}/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-bold truncate", theme.text.primary)}>{cit.citation}</p>
                                        <p className={cn("text-[10px] truncate", theme.text.secondary)}>{cit.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {argument.relatedCitationIds.map(id => {
                            const cit = allCitations.find(c => c.id === id);
                            return cit ? (
                                <div key={id} className={cn("flex items-start p-3 rounded border shadow-sm group", theme.surface.default, theme.border.default)}>
                                    <Scale className={cn("h-5 w-5 mt-0.5 mr-3 shrink-0", theme.action.primary.text)}/>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <p className={cn("text-sm font-bold hover:underline cursor-pointer", theme.text.link)}>{cit.citation}</p>
                                            <button onClick={() => toggleLink(id, 'citation')} title="Remove citation" className={cn("opacity-0 group-hover:opacity-100 hover:text-red-500", theme.text.tertiary)}><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                        <p className={cn("text-xs font-medium", theme.text.primary)}>{cit.title}</p>
                                        <p className={cn("text-xs mt-1 italic", theme.text.secondary)}>{cit.description}</p>
                                    </div>
                                </div>
                            ) : null;
                        })}
                        {argument.relatedCitationIds.length === 0 && <p className={cn("text-sm italic text-center py-4", theme.text.tertiary)}>No authorities linked.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'evidence' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className={cn("text-sm font-bold uppercase", theme.text.secondary)}>Supporting Evidence ({argument.relatedEvidenceIds?.length || 0})</h4>
                        <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsLinkingEvidence(!isLinkingEvidence)}>
                            {isLinkingEvidence ? 'Done' : 'Link Evidence'}
                        </Button>
                    </div>

                    {isLinkingEvidence && (
                        <div className={cn("p-3 rounded-lg border mb-4 max-h-48 overflow-y-auto", theme.surface.highlight, theme.border.default)}>
                            {allEvidence.map(ev => (
                                <div key={ev.id} onClick={() => toggleLink(ev.id, 'evidence')} className={cn("flex items-center p-2 rounded cursor-pointer transition-colors", argument.relatedEvidenceIds?.includes(ev.id as EvidenceId) ? theme.surface.highlight : `hover:${theme.surface.default}`)}>
                                    <div className={cn("w-4 h-4 border rounded mr-3 flex items-center justify-center", theme.surface.default, argument.relatedEvidenceIds?.includes(ev.id as EvidenceId) ? theme.action.primary.border : theme.border.default)}>
                                        {argument.relatedEvidenceIds?.includes(ev.id as EvidenceId) && <div className={cn("w-2 h-2 rounded-full", theme.action.primary.bg)}/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-bold truncate", theme.text.primary)}>{ev.title}</p>
                                        <p className={cn("text-[10px] truncate", theme.text.secondary)}>{ev.type} • {ev.collectionDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {argument.relatedEvidenceIds?.map(id => {
                            const ev = allEvidence.find(e => e.id === id);
                            return ev ? (
                                <div key={id} className={cn("flex items-start p-3 rounded border shadow-sm group", theme.surface.default, theme.border.default)}>
                                    <Fingerprint className={cn("h-5 w-5 mt-0.5 mr-3 shrink-0", theme.status.warning.text)}/>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <p className={cn("text-sm font-bold", theme.text.primary)}>{ev.title}</p>
                                            <button onClick={() => toggleLink(id, 'evidence')} title="Remove evidence" className={cn("opacity-0 group-hover:opacity-100 hover:text-red-500", theme.text.tertiary)}><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                        <p className={cn("text-xs mt-1", theme.text.secondary)}>{ev.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={cn("text-[10px] border px-1.5 py-0.5 rounded", theme.surface.highlight, theme.border.default)}>{ev.id}</span>
                                            <span className={cn("text-[10px] border px-1.5 py-0.5 rounded", theme.surface.highlight, theme.border.default)}>{ev.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })}
                         {(!argument.relatedEvidenceIds || argument.relatedEvidenceIds.length === 0) && <p className={cn("text-sm italic text-center py-4", theme.text.tertiary)}>No evidence linked.</p>}
                    </div>
                 </div>
            )}

            {activeTab === 'analysis' && (
                <div className="space-y-6">
                     {isAnalyzing ? (
                         <div className="flex flex-col items-center justify-center py-12">
                             <Wand2 className="h-8 w-8 text-indigo-500 animate-pulse mb-3"/>
                             <p className="text-sm font-medium text-indigo-700">Consulting Gemini AI...</p>
                         </div>
                     ) : aiAnalysis ? (
                         <div className="prose prose-sm max-w-none">
                             <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-4">
                                 <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center"><AlertTriangle className="h-4 w-4 mr-2"/> Counter-Argument Risk</h4>
                                 <p className="text-xs text-red-700">AI has identified 2 potential weaknesses in your jurisdiction argument.</p>
                             </div>
                             <div className={cn("whitespace-pre-wrap leading-relaxed", theme.text.secondary)}>{aiAnalysis}</div>

                             <Button variant="outline" className="w-full mt-6" onClick={handleAnalyze}>Regenerate Analysis</Button>
                         </div>
                     ) : (
                         <div className="text-center py-12">
                             <Button variant="primary" icon={Wand2} onClick={handleAnalyze}>Start AI Stress Test</Button>
                         </div>
                     )}
                </div>
            )}
        </div>

        <div className={cn("p-4 border-t flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <button onClick={() => onDelete(argument.id)} className="text-red-600 text-xs font-bold hover:underline flex items-center"><Trash2 className="h-3 w-3 mr-1"/> Delete</button>
            <Button variant="primary" icon={Save} onClick={onClose}>Save Changes</Button>
        </div>
    </div>
  );
};
