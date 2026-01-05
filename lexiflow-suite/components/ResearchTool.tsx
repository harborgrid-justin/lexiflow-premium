
import React, { useState, useTransition } from 'react';
import { Search, ExternalLink, BookOpen, Loader2, Bookmark, Share2, Scale, Gavel, History, Bot } from 'lucide-react';
import { GeminiService } from '../services/geminiService.ts';
import { ResearchSession } from '../types.ts';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Card } from './common/Card.tsx';
import { Badge } from './common/Badge.tsx';
import { Button } from './common/Button.tsx';
import { StatuteViewer } from './research/StatuteViewer.tsx';
import { CitationAnalysis } from './research/CitationAnalysis.tsx';

export const ResearchTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
        setActiveTab(tabId);
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const result = await GeminiService.conductResearch(query);
    
    startTransition(() => {
        const newSession: ResearchSession = {
        id: crypto.randomUUID(),
        query,
        response: result.text,
        sources: result.sources,
        timestamp: new Date().toLocaleTimeString()
        };

        setHistory([newSession, ...history]);
        setActiveSessionId(newSession.id);
        setIsLoading(false);
        setQuery('');
    });
  };

  const activeSession = history.find(s => s.id === activeSessionId) || history[0];

  const tabs = [
      { id: 'assistant', label: 'AI Research Assistant', icon: Bot },
      { id: 'statutes', label: 'Statute Browser', icon: Scale },
      { id: 'citations', label: 'Citation Analysis', icon: Gavel },
      { id: 'history', label: 'Search History', icon: History },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Legal Research" 
            subtitle="AI-powered case law analysis, statutory interpretation, and precedent search."
            actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Bookmark}>Saved Briefs</Button>
                    <Button variant="primary" icon={BookOpen}>New Memo</Button>
                </div>
            }
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeTab === 'assistant' && (
            <div className="h-full flex flex-col p-6 pt-4">
                 <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                    <form onSubmit={handleSearch} className="relative shrink-0 mb-6 z-10">
                        <div className="relative flex items-center shadow-md rounded-xl bg-white border border-slate-200 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask a complex legal question (e.g. 'Standard for piercing corporate veil in Delaware')..."
                                className="w-full pl-12 pr-32 py-4 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <button 
                                    type="submit" 
                                    disabled={isLoading || !query.trim()}
                                    className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Research'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {activeSession ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 leading-snug">{activeSession.query}</h3>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                            <Bot className="h-3 w-3 text-blue-500"/> Generated by LexiFlow AI • Grounded via Google Search
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" icon={Share2}>Share</Button>
                                        <Button size="sm" variant="outline" icon={Bookmark}>Save</Button>
                                    </div>
                                </div>

                                <Card className="shadow-sm border-blue-100 bg-white">
                                    <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line font-serif p-2">
                                        {activeSession.response}
                                    </div>
                                </Card>

                                {activeSession.sources.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1 flex items-center gap-2">
                                            <Scale className="h-3 w-3"/> Authorities Cited
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {activeSession.sources.map((source, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors shadow-sm flex flex-col group cursor-pointer" onClick={() => window.open(source.url, '_blank')}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-sm font-bold text-blue-700 hover:underline line-clamp-1 flex items-center gap-1.5">
                                                            {source.title} <ExternalLink className="h-3 w-3 opacity-50"/>
                                                        </span>
                                                        <Badge variant="neutral" className="text-[9px]">Web Source</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{source.snippet}</p>
                                                    <p className="text-[9px] text-slate-400 mt-2 font-mono truncate">{source.url}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 pb-20">
                                <BookOpen className="h-16 w-16 mb-4" />
                                <p className="text-lg font-medium">Enter a query to begin research</p>
                                <p className="text-sm mt-2">Search case law, statutes, and secondary sources.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        )}

        {activeTab === 'statutes' && (
            <div className="h-full overflow-hidden p-6 pt-4">
                <StatuteViewer />
            </div>
        )}

        {activeTab === 'citations' && (
            <div className="h-full overflow-y-auto p-6 pt-4">
                <div className="max-w-7xl mx-auto">
                    <CitationAnalysis />
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="h-full overflow-y-auto p-6 pt-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Research History</h3>
                    {history.length === 0 && <p className="text-slate-500 italic">No history available.</p>}
                    {history.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => { setActiveSessionId(session.id); setActiveTab('assistant'); }}
                            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer shadow-sm transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{session.query}</h4>
                                <span className="text-xs text-slate-400">{session.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{session.response}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium border border-slate-200">
                                    {session.sources.length} Sources
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
