
import React, { useState, useTransition, useCallback, useMemo } from 'react';
import { Case, CaseStatus } from '../../types.ts';
import { Filter, RefreshCcw, User, ArrowUp, ArrowDown, Eye, Edit, Trash, Download, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Currency } from '../common/Primitives.tsx';
import { useSort } from '../../hooks/useSort.ts';
import { ActionMenu } from '../common/ActionMenu.tsx';
import { useActions } from '../../hooks/useData.ts';

interface CaseListActiveProps {
  cases: Case[];
  onSelectCase: (c: Case) => void;
  isLoading?: boolean;
}

export const CaseListActive: React.FC<CaseListActiveProps> = ({
  cases,
  onSelectCase,
  isLoading = false
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const actions = useActions();

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesType = typeFilter === 'All' || c.matterType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [cases, statusFilter, typeFilter]);

  const { items: sortedCases, requestSort, sortConfig } = useSort<Case>(filteredCases, 'filingDate', 'desc');
  const [isPending, startTransition] = useTransition();

  const handleSort = useCallback((key: keyof Case) => {
      startTransition(() => {
          requestSort(key);
      });
  }, [requestSort]);

  const resetFilters = () => {
    setStatusFilter('All');
    setTypeFilter('All');
  };

  const SortIcon = ({ column }: { column: keyof Case }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-25" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 text-blue-600" /> : <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />;
  };

  const getAriaSort = (column: keyof Case) => {
    if (sortConfig.key !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative group/container">
      {/* Component ID */}
      <div className="absolute top-0 right-0 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 group-hover/container:opacity-100 transition-opacity">
          CM-02
        </span>
      </div>

      {/* Enterprise Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all shadow-inner">
            <Filter className="h-4 w-4 text-slate-400 mr-3"/>
            <select 
              className="bg-transparent text-xs font-black uppercase tracking-wider text-slate-700 outline-none border-none pr-6 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all shadow-inner">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 mr-3"/>
            <select 
              className="bg-transparent text-xs font-black uppercase tracking-wider text-slate-700 outline-none border-none pr-6 cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by Type"
            >
              <option value="All">All Types</option>
              <option value="Litigation">Litigation</option>
              <option value="M&A">M&A</option>
              <option value="IP">IP</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>
          
          {(statusFilter !== 'All' || typeFilter !== 'All') && (
            <button 
              onClick={resetFilters}
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 px-3 transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => actions.syncData()} className="text-slate-400 hover:text-blue-600 font-bold uppercase tracking-widest text-[9px]">Sync Engine</Button>
          <Button variant="outline" size="sm" icon={Download} className="rounded-xl border-slate-200 font-bold uppercase tracking-widest text-[9px]">Export Ledger</Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`hidden md:flex flex-1 min-h-0 flex-col transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <TableContainer className="h-full border-slate-200 rounded-2xl shadow-md">
          <TableHeader>
            <TableHead className="w-[30%] cursor-pointer group hover:bg-slate-100 transition-colors py-5" onClick={() => handleSort('title')} aria-sort={getAriaSort('title')}>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest">Matter Profile <SortIcon column="title"/></div>
            </TableHead>
            <TableHead className="w-[15%] cursor-pointer group hover:bg-slate-100 transition-colors py-5" onClick={() => handleSort('matterType')} aria-sort={getAriaSort('matterType')}>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest">Class <SortIcon column="matterType"/></div>
            </TableHead>
            <TableHead className="w-[20%] cursor-pointer group hover:bg-slate-100 transition-colors py-5" onClick={() => handleSort('client')} aria-sort={getAriaSort('client')}>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest">Client <SortIcon column="client"/></div>
            </TableHead>
            <TableHead className="w-[15%] cursor-pointer group hover:bg-slate-100 transition-colors py-5" onClick={() => handleSort('value')} aria-sort={getAriaSort('value')}>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest">Valuation <SortIcon column="value"/></div>
            </TableHead>
            <TableHead className="w-[10%] py-5 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
            <TableHead className="w-[10%] text-right py-5 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableSkeleton rows={8} cols={6} rowClassName="h-24" cellClassName="px-6 py-6" />
            ) : sortedCases.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        No matters found matching criteria.
                    </TableCell>
                </TableRow>
            ) : (
                sortedCases.map((c) => (
                <TableRow key={c.id} onClick={() => onSelectCase(c)} className="cursor-pointer group hover:bg-blue-50/20">
                    <TableCell className="py-6">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-sm tracking-tight" title={c.title}>{c.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">{c.id}</span>
                    </div>
                    </TableCell>
                    <TableCell className="py-6">
                    <Badge variant="neutral" className="font-bold text-[9px] uppercase">{c.matterType}</Badge>
                    </TableCell>
                    <TableCell className="py-6">
                    <div className="flex items-center text-slate-600 font-medium text-sm">
                        <User className="h-4 w-4 mr-2.5 text-slate-300"/>
                        <span className="truncate max-w-[150px] tracking-tight">{c.client}</span>
                    </div>
                    </TableCell>
                    <TableCell className="py-6">
                    <Currency value={c.value} className="text-slate-900 font-black tabular-nums text-sm" />
                    </TableCell>
                    <TableCell className="py-6">
                    <Badge variant={c.status === 'Trial' ? 'warning' : c.status === 'Discovery' ? 'info' : 'neutral'} className="font-black text-[9px] py-0 px-2 shadow-sm">
                        {c.status?.toUpperCase()}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right py-6">
                    <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={e => e.stopPropagation()}>
                        <ActionMenu actions={[
                        { label: 'Matter Timeline', icon: Eye, onClick: () => onSelectCase(c) },
                        { label: 'Edit Metadata', icon: Edit, onClick: () => alert('Edit ' + c.id) },
                        { label: 'Archive Record', icon: Trash, onClick: () => alert('Archive ' + c.id), variant: 'danger' }
                        ]} />
                    </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden space-y-4 pb-24 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
             ))
        ) : (
            sortedCases.map((c) => (
            <div 
                key={c.id} 
                onClick={() => onSelectCase(c)} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 active:scale-[0.98] transition-all duration-200 hover:shadow-md"
            >
                <div className="flex justify-between items-start mb-4">
                <Badge variant={c.status === 'Trial' ? 'warning' : c.status === 'Discovery' ? 'info' : 'neutral'} className="font-black text-[8px] uppercase">
                    {c.status}
                </Badge>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">{c.id}</span>
                </div>
                
                <h4 className="font-black text-slate-900 text-lg mb-2 leading-tight tracking-tight">{c.title}</h4>
                
                <div className="flex items-center text-sm text-slate-500 font-medium mb-5">
                <User className="h-4 w-4 mr-2 text-slate-300"/> 
                <span className="truncate">{c.client}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col shadow-inner">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Matter WIP</span>
                        <Currency value={c.value} className="text-slate-900 font-black text-base tabular-nums" />
                    </div>
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col shadow-inner">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Filing Date</span>
                        <span className="font-bold text-slate-700 text-sm">
                            {c.filingDate}
                        </span>
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
