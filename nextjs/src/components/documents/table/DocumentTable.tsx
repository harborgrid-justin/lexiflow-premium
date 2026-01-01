import { cn } from '@/lib/utils';
import { LegalDocument } from '@/types/documents';
import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { DocumentRow } from './DocumentRow';

interface DocumentTableProps {
  documents: LegalDocument[];
  viewMode: 'list' | 'grid';
  selectedDocs: string[];
  toggleSelection: (id: string, event?: React.MouseEvent | React.ChangeEvent) => void;
  selectAll: () => void;
  isAllSelected: boolean;
  isSelected: (id: string) => boolean;
  setSelectedDocForHistory: (doc: LegalDocument) => void;
  setTaggingDoc: (doc: LegalDocument) => void;
  onRowClick?: (doc: LegalDocument) => void;
}

export const DocumentTable = ({
  documents, toggleSelection, selectAll, isAllSelected, isSelected, setSelectedDocForHistory, setTaggingDoc, onRowClick
}: DocumentTableProps) => {
  const [sortField, setSortField] = useState<keyof LegalDocument>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isPending, startTransition] = useTransition();

  const handleSort = useCallback((field: keyof LegalDocument) => {
    startTransition(() => {
      setSortDir(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
      if (sortField !== field) setSortField(field);
    });
  }, [sortField]);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [documents, sortField, sortDir]);

  return (
    <div className={cn("flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900", isPending ? "opacity-70 transition-opacity" : "")}>
      <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <div className="w-10 flex-shrink-0 flex justify-center">
          <input type="checkbox" onChange={selectAll} checked={isAllSelected} className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
        </div>
        <div className="flex-1 cursor-pointer flex items-center" onClick={() => handleSort('title')}>
          Document Name
          {sortField === 'title' && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
        </div>
        <div className="w-28 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('sourceModule')}>
          Source
          {sortField === 'sourceModule' && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
        </div>
        <div className="w-28 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('status')}>
          Status
          {sortField === 'status' && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
        </div>
        <div className="w-48 flex-shrink-0">Tags & Rules</div>
        <div className="w-32 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('updatedAt')}>
          Modified
          {sortField === 'updatedAt' && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {sortedDocuments.length > 0 ? (
          sortedDocuments.map(doc => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              isSelected={isSelected(doc.id)}
              toggleSelection={toggleSelection}
              setSelectedDocForHistory={setSelectedDocForHistory}
              setTaggingDoc={setTaggingDoc}
              onRowClick={onRowClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>No documents found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
