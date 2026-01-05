
import React, { useState, useMemo, useDeferredValue, useTransition } from 'react';
import { 
  Search, Filter, Calendar, FileText, Download, Gavel, 
  Bell, Eye, AlertCircle, RefreshCw, ChevronRight, Lock, 
  ArrowLeft, Clock, Plus, Trash2, Edit2, CheckCircle
} from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton } from './common/Table.tsx';
import { Badge } from './common/Badge.tsx';
import { Modal } from './common/Modal.tsx';
import { MetricCard } from './common/Primitives.tsx';
import { MOCK_DOCKET_ENTRIES } from '../data/mockDocket.ts';
import { MOCK_CASES } from '../data/mockCases.ts';
import { DocketEntry, DocketEntryType } from '../types.ts';
import { DocketEntryModal } from './docket/DocketEntryModal.tsx';
import { useData } from '../hooks/useData.ts';

export const DocketManager: React.FC = () => {
  const [entries, setEntries] = useState<DocketEntry[]>(MOCK_DOCKET_ENTRIES);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [activeTab, setActiveTab] = useState<'all' | 'filings' | 'orders'>('all');
  const [selectedEntry, setSelectedEntry] = useState<DocketEntry | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DocketEntry | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const getIconForType = (type: DocketEntryType) => {
    switch (type) {
      case 'Order': return <Gavel className="h-4 w-4 text-red-600" />;
      case 'Filing': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'Minute Entry': return <Clock className="h-4 w-4 text-slate-500" />;
      case 'Notice': return <Bell className="h-4 w-4 text-amber-600" />;
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleSaveEntry = (entry: DocketEntry) => {
      startTransition(() => {
          if (editingEntry) {
              setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
          } else {
              setEntries(prev => [entry, ...prev]);
          }
          setEditingEntry(null);
      });
  };

  const handleDeleteEntry = (id: string) => {
      if (confirm('Are you sure you want to delete this docket record?')) {
          startTransition(() => {
              setEntries(prev => prev.filter(e => e.id !== id));
              if (selectedEntry?.id === id) setSelectedEntry(null);
          });
      }
  };

  const handleEditEntry = (entry: DocketEntry) => {
      setEditingEntry(entry);
      setIsEditModalOpen(true);
  };

  const handleCreateEntry = () => {
      setEditingEntry(null);
      setIsEditModalOpen(true);
  };

  const filteredEntries = useMemo(() => {
    let data = selectedCaseId 
      ? entries.filter(e => e.caseId === selectedCaseId)
      : entries;

    return data.filter(entry => {
      const term = deferredSearchTerm.toLowerCase();
      const matchesSearch = 
        entry.title.toLowerCase().includes(term) || 
        entry.description?.toLowerCase().includes(term) ||
        entry.caseId.toLowerCase().includes(term);
      
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'orders' ? entry.type === 'Order' :
        activeTab === 'filings' ? entry.type === 'Filing' : true;

      return matchesSearch && matchesTab;
    }).sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.sequenceNumber - a.sequenceNumber;
    });
  }, [deferredSearchTerm, activeTab, selectedCaseId, entries]);

  const selectedCase = useMemo(() => 
    selectedCaseId ? MOCK_CASES.find(c => c.id === selectedCaseId) : null
  , [selectedCaseId]);

  const stats = useMemo(() => {
      return { filings: 12, orders: 3, deadlines: 8 };
  }, [entries]);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative">
       {/* Component ID Badge */}
       <div className="absolute top-2 right-6 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
          DK-01
        </span>
      </div>

      <DocketEntryModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        entry={editingEntry}
        onSave={handleSaveEntry}
      />

      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title={selectedCase ? `Docket: ${selectedCase.title}` : "Master Docket"} 
            subtitle={selectedCase ? `${selectedCase.id} • ${selectedCase.court}` : "Centralized federal and state court filings, orders, and automated deadline tracking."}
            actions={
            <div className="flex gap-2">
                {selectedCaseId && (
                <Button variant="ghost" icon={ArrowLeft} onClick={() => setSelectedCaseId(null)}>Back to Master</Button>
                )}
                <Button variant="secondary" icon={RefreshCw}>Sync ECF/PACER</Button>
                <Button variant="primary" icon={Download}>Batch Export</Button>
            </div>
            }
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-[1920px] mx-auto flex flex-col h-full space-y-6">
            {!selectedCaseId && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <MetricCard label="Recent Filings" value={stats.filings} icon={FileText} className="border-l-4 border-l-blue-500"/>
                    <MetricCard label="New Orders" value={stats.orders} icon={Gavel} className="border-l-4 border-l-red-500"/>
                    <MetricCard label="Deadlines" value={stats.deadlines} icon={Clock} className="border-l-4 border-l-amber-500"/>
                    <MetricCard label="Sync Health" value="100% Online" icon={CheckCircle} className="border-l-4 border-l-green-500" trendUp={true}/>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start flex-1 min-h-0">
                <aside className="w-full md:w-64 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center uppercase tracking-widest"><Filter className="h-3.5 w-3.5 mr-2"/> Filters</h3>
                </div>
                <div className="p-4 space-y-6 overflow-y-auto flex-1">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 bg-white transition-all"
                        placeholder="Search docket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                    
                    <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['all', 'filings', 'orders'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setActiveTab(t as any)} 
                                className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    </div>
                    
                    {!selectedCaseId && (
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Filter By Case</label>
                        <div className="space-y-1">
                        {MOCK_CASES.map(c => (
                            <button 
                            key={c.id} 
                            onClick={() => setSelectedCaseId(c.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border border-transparent hover:border-slate-100 flex flex-col gap-0.5"
                            >
                            <div className="font-bold truncate w-full">{c.title}</div>
                            <div className="text-[10px] font-mono text-slate-400">{c.id}</div>
                            </button>
                        ))}
                        </div>
                    </div>
                    )}
                    
                    <div className="pt-4 border-t border-slate-100">
                        <Button className="w-full" size="sm" variant="outline" icon={Plus} onClick={handleCreateEntry}>Manual Entry</Button>
                    </div>
                </div>
                </aside>

                <div className="flex-1 min-w-0 w-full h-full flex flex-col">
                    <TableContainer className="border border-slate-200 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
                        <TableHeader>
                        <TableHead className="w-20">Seq</TableHead>
                        <TableHead className="w-28">Date</TableHead>
                        <TableHead className="w-32">Case</TableHead>
                        <TableHead>Docket Text</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableHeader>
                        <div className="overflow-y-auto flex-1 bg-white">
                        <TableBody>
                        {filteredEntries.map(entry => (
                            <TableRow key={entry.id} className="group cursor-pointer hover:bg-blue-50/10" onClick={() => setSelectedEntry(entry)}>
                            <TableCell className="font-mono text-[11px] font-bold text-slate-400 text-center">#{entry.sequenceNumber}</TableCell>
                            <TableCell className="text-slate-600 text-xs font-bold whitespace-nowrap">{entry.date}</TableCell>
                            <TableCell>
                                <span 
                                className="text-[10px] font-mono text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setSelectedCaseId(entry.caseId); }}
                                >
                                {entry.caseId}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1.5 py-1">
                                <div className="flex items-center gap-2">
                                    {entry.isSealed && <Lock className="h-3 w-3 text-red-500" />}
                                    {getIconForType(entry.type)}
                                    <span className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">{entry.title}</span>
                                </div>
                                {entry.description && <p className="text-xs text-slate-500 line-clamp-2 pl-6 leading-relaxed">{entry.description}</p>}
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex gap-1 pl-6">
                                        {entry.tags.map(t => <span key={t} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">{t}</span>)}
                                    </div>
                                )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }}><Edit2 size={14}/></button>
                                    <button className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}><Trash2 size={14}/></button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        {filteredEntries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                    No entries found for current filters.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                        </div>
                    </TableContainer>
                </div>
            </div>

            <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="Matter Record Intelligence" size="lg">
                {selectedEntry && (
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">Docket Entry #{selectedEntry.sequenceNumber}</span>
                        <Badge variant="neutral" className="px-3 py-1 font-bold uppercase">{selectedEntry.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Filed on {selectedEntry.date} by <span className="text-slate-800 font-bold">{selectedEntry.filedBy}</span></p>
                    </div>
                    <div className="flex gap-2">
                        {selectedEntry.isSealed && <span className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100"><Lock size={12}/> SEALED</span>}
                    </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Docket Text</h4>
                    <p className="text-base text-slate-800 leading-relaxed font-serif">{selectedEntry.title}</p>
                    {selectedEntry.description && <p className="text-sm text-slate-600 mt-4 leading-relaxed italic border-l-2 border-slate-300 pl-4">{selectedEntry.description}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                    <Button variant="ghost" className="text-slate-500" onClick={() => setSelectedEntry(null)}>Close</Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => { handleEditEntry(selectedEntry); setSelectedEntry(null); }}>Edit Record</Button>
                        <Button variant="primary" onClick={() => { setSelectedCaseId(selectedEntry.caseId); setSelectedEntry(null); }}>View Matter</Button>
                    </div>
                    </div>
                </div>
                )}
            </Modal>
        </div>
      </div>
    </div>
  );
};
