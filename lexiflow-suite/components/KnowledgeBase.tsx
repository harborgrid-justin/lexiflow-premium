
import React, { useState, useTransition, useDeferredValue, useMemo } from 'react';
import { Search, Book, FileText, Lightbulb, MessageCircle, ChevronRight, Hash, Star, Layout, Library, HelpCircle } from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Button } from './common/Button.tsx';

export const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wiki');
  const [searchTerm, setSearchTerm] = useState('');
  
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (t: string) => {
      startTransition(() => {
          setActiveTab(t);
      });
  };

  const tabs = [
      { id: 'wiki', label: 'Practice Wiki', icon: Book },
      { id: 'precedents', label: 'Precedents', icon: Library },
      { id: 'qa', label: 'Firm Q&A', icon: HelpCircle },
  ];

  // Mock list for filtering demonstration
  const articles = useMemo(() => [
      { id: '1', title: 'Civil Litigation (CA)', type: 'Guide' },
      { id: '2', title: 'Corporate Formation', type: 'Guide' },
      { id: '3', title: 'IP Filing Protocol', type: 'Guide' },
      { id: '4', title: 'Billing Codes', type: 'Ops' },
      { id: '5', title: 'IT Security Policy', type: 'Ops' },
  ], []);

  const filteredArticles = useMemo(() => {
      if (!deferredSearchTerm) return articles;
      return articles.filter(a => a.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()));
  }, [deferredSearchTerm, articles]);

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
        <div className="px-6 pt-6 pb-2 shrink-0">
            <PageHeader 
                title="Knowledge Base" 
                subtitle="Firm-wide intelligence, precedents, and internal wiki."
                actions={
                    <Button variant="primary" icon={FileText}>New Article</Button>
                }
            />
            <TabNavigation 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
            />
        </div>

        <div className={`flex-1 min-h-0 overflow-hidden p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-72 bg-slate-50/50 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4"/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-6">
                        <div>
                            <h4 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Practice Guides</h4>
                            <ul className="space-y-0.5">
                                {filteredArticles.filter(a => a.type === 'Guide').map(a => (
                                    <li key={a.id} className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center justify-between group">
                                        <span className="group-hover:text-blue-600 transition-colors">{a.title}</span> 
                                        {a.title.includes('Civil') && <ChevronRight className="h-4 w-4 opacity-50"/>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Internal Ops</h4>
                            <ul className="space-y-0.5">
                                {filteredArticles.filter(a => a.type === 'Ops').map(a => (
                                    <li key={a.id} className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                                        {a.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                    {activeTab === 'wiki' && (
                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                                <span>Library</span> <ChevronRight className="h-3 w-3"/> <span>Litigation</span> <ChevronRight className="h-3 w-3"/> <span className="font-semibold text-slate-900">California Employment</span>
                            </div>
                            
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">California Employment Litigation Playbook</h1>
                            <div className="flex gap-4 mb-8 text-sm border-b border-slate-100 pb-4">
                                <span className="flex items-center text-slate-500"><Book className="h-4 w-4 mr-1"/> Last updated: 2 days ago</span>
                                <span className="flex items-center text-slate-500"><Star className="h-4 w-4 mr-1"/> 12 Favorites</span>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <h3>1. Initial Case Assessment</h3>
                                <p>When a new employment discrimination case is assigned, the following steps must be taken within 48 hours:</p>
                                <ul>
                                    <li>Conflict check (Global)</li>
                                    <li>Preservation Letter to Client (Litigation Hold)</li>
                                    <li>Review of DFEH/EEOC Right-to-Sue notices</li>
                                </ul>

                                <h3>2. Responsive Pleading Strategy</h3>
                                <p>In California Superior Court, demurrers are common but strategic. Consider whether a Demurrer will actually dispose of claims or just educate the plaintiff.</p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 not-prose text-sm text-amber-800">
                                    <strong>Tip:</strong> Always check the local rules of the specific department. Dept 504 requires a pre-filing conference.
                                </div>

                                <h3>3. Discovery</h3>
                                <p>Standard form interrogatories are mandatory. See <code>Form DISC-001</code> in Document Templates.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'precedents' && (
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                            <div className="p-6 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-3">
                                    <FileText className="h-6 w-6 text-blue-600"/>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Winning Motion</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Smith v. MegaCorp (2021)</h3>
                                <p className="text-sm text-slate-600 mt-2">Successful Summary Judgment motion on Age Discrimination claim based on RIF statistics.</p>
                                <div className="mt-4 text-xs text-slate-400 font-mono">Doc ID: PREC-2021-042</div>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-3">
                                    <FileText className="h-6 w-6 text-blue-600"/>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Settlement</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Doe v. TechGiant (2019)</h3>
                                <p className="text-sm text-slate-600 mt-2">Class Action Settlement Agreement template with distinct FLSA release language.</p>
                                <div className="mt-4 text-xs text-slate-400 font-mono">Doc ID: PREC-2019-110</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'qa' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-blue-500"/>
                                        How do we handle "Service of Process" for international defendants in China?
                                    </h3>
                                    <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">JD</div>
                                        <span>James Doe • 2 days ago</span>
                                    </div>
                                    
                                    <div className="mt-6 ml-4 pl-4 border-l-2 border-green-500">
                                        <p className="text-sm text-slate-800 leading-relaxed">
                                            Requires compliance with the Hague Convention. Do not attempt direct mail. Use the central authority pathway. Note that China has made specific reservations regarding service by mail.
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Verified Answer</span>
                                            <span className="text-xs text-slate-400">by Partner Sarah Miller</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 bg-slate-50">
                                <button className="w-full py-3 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium hover:text-blue-600 hover:border-blue-400 transition-colors shadow-sm">
                                    Ask a Question to the Firm
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
