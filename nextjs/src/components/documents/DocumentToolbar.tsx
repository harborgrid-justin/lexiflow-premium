import { cn } from '@/lib/utils';
import { Grid, Layout, List, MoreHorizontal, Search, Split, Wand2 } from 'lucide-react';
import React from 'react';

interface DocumentToolbarProps {
  selectedDocsCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  isDetailsOpen: boolean;
  setIsDetailsOpen: (isOpen: boolean) => void;
  isProcessingAI: boolean;
  onBulkSummarize: () => void;
  onClearSelection: () => void;
}

export function DocumentToolbar({
  selectedDocsCount,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  isDetailsOpen,
  setIsDetailsOpen,
  isProcessingAI,
  onBulkSummarize,
  onClearSelection
}: DocumentToolbarProps) {

  const handleCompare = () => {
    console.log('Compare clicked');
  };

  return (
    <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 flex-1">
        {selectedDocsCount > 0 ? (
          <div className="flex items-center px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 w-full animate-in fade-in duration-200">
            <span className="text-sm font-bold mr-4 text-blue-700 dark:text-blue-400">{selectedDocsCount} Selected</span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800" title="Compare" onClick={handleCompare}><Split className="h-4 w-4" /></button>
              <button className="p-1 rounded text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800" title="Summarize" onClick={onBulkSummarize}>
                {isProcessingAI ? <span className="animate-spin">...</span> : <Wand2 className="h-4 w-4" />}
              </button>
              <button className="p-1 rounded text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800" title="Tag"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            <div className="flex-1"></div>
            <button onClick={onClearSelection} className="text-xs hover:underline text-blue-700 dark:text-blue-400">Clear</button>
          </div>
        ) : (
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors group-focus-within:text-blue-500 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by name, tag, or content..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
        <div className="flex p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === 'list'
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === 'grid'
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className={cn(
            "p-2 rounded-md border transition-all",
            isDetailsOpen
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          title="Toggle Details"
        >
          <Layout className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
