
import React, { useState, useDeferredValue, useMemo, useTransition } from 'react';
import { Clause } from '../types.ts';
import { Search, BarChart2, ShieldAlert, FileText, History, ScrollText, GitBranch, AlertTriangle } from 'lucide-react';
import { ClauseHistoryModal } from './ClauseHistoryModal.tsx';
import { MOCK_CLAUSES } from '../data/mockClauses.ts';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Button } from './common/Button.tsx';

export const ClauseLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (t: string) => {
      startTransition(() => {
          setActiveTab(t);
      });
  };

  const filteredClauses = useMemo(() => {
      const term = deferredSearchTerm.toLowerCase();
      return MOCK_CLAUSES.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.category.toLowerCase().includes(term)
      );
  }, [deferredSearchTerm]);

  const tabs = [
      { id: 'browse', label: 'Browse Library', icon: ScrollText },
      { id: 'history', label: 'Drafting History', icon: History },
      { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      {selectedClause && (
        <ClauseHistoryModal clause={selectedClause} onClose={() => setSelectedClause(null)} />
      )}

      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Clause Library" 
            subtitle="Standardized legal provisions, risk ratings, and usage metrics."
            actions={
                <Button variant="primary" icon={FileText}>New Clause</Button>
            }
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'browse' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Search clauses by name or category..."
                            />
                        </div>
                        <div className="flex gap-2">
                             <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none"><option>All Categories</option><option>Liability</option><option>Employment</option></select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClauses.map(clause => (
                        <div key={clause.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md hover:border-blue-300 transition-all group">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-xl">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{clause.category}</span>
                                <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-700 transition-colors">{clause.name}</h3>
                            </div>
                            {clause.riskRating === 'High' && (
                                <div title="High Risk" className="bg-red-50 p-1.5 rounded-full border border-red-100">
                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                </div>
                            )}
                            </div>
                            <div className="p-5 flex-1">
                            <p className="text-xs text-slate-600 line-clamp-4 font-serif leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                "{clause.content}"
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center"><FileText className="h-3 w-3 mr-1.5"/> Ver: {clause.version}</div>
                                <div className="flex items-center"><BarChart2 className="h-3 w-3 mr-1.5"/> Used: {clause.usageCount}x</div>
                                <div className="col-span-2">Updated: {clause.lastUpdated}</div>
                            </div>
                            </div>
                            <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                            <button 
                                onClick={() => setSelectedClause(clause)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                            >
                                <History className="h-3 w-3 mr-1.5"/> View History
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'risk' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <div className="bg-slate-100 p-6 rounded-full mb-4">
                         <AlertTriangle className="h-12 w-12 text-slate-300"/>
                     </div>
                     <h3 className="text-lg font-bold text-slate-600">Risk Analysis Dashboard</h3>
                     <p className="text-sm">Select a category to view aggregate risk exposure.</p>
                </div>
            )}

             {activeTab === 'history' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <div className="bg-slate-100 p-6 rounded-full mb-4">
                         <GitBranch className="h-12 w-12 text-slate-300"/>
                     </div>
                     <h3 className="text-lg font-bold text-slate-600">Global Revision Log</h3>
                     <p className="text-sm">Track changes across all clause templates.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
