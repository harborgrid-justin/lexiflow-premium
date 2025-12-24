
import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { Download, Eye, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { LegalDocument } from '../../../../types';
import { Modal } from '../../../components/molecules/Modal';
import { RuleSelector } from '../../../components/molecules/RuleSelector';
import { Button } from '../../../components/atoms/Button';
import { DocumentRow } from './DocumentRow';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { VirtualList } from '../../../components/organisms/VirtualList';

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

export const DocumentTable: React.FC<DocumentTableProps> = ({ 
  documents, viewMode, selectedDocs, toggleSelection, selectAll, isAllSelected, isSelected, setSelectedDocForHistory, setTaggingDoc, onRowClick 
}) => {
  const { theme } = useTheme();
  const [ruleModalDoc, setRuleModalDoc] = useState<LegalDocument | null>(null);
  const [sortField, setSortField] = useState<keyof LegalDocument>('lastModified');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isPending, startTransition] = useTransition();

  const handleSort = useCallback((field: keyof LegalDocument) => {
      startTransition(() => {
          setSortDir(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
          if (sortField !== field) setSortField(field);
      });
  }, [sortField]);

  const SortIcon = ({ field }: { field: keyof LegalDocument }) => {
      if (sortField !== field) return null;
      return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
  };

  const sortedDocuments = useMemo(() => {
      return [...documents].sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || bVal === undefined) return 0;
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });
  }, [documents, sortField, sortDir]);
  
  const renderVirtualRow = (doc: LegalDocument) => (
      <DocumentRow 
          doc={doc}
          isSelected={isSelected(doc.id)}
          toggleSelection={toggleSelection}
          setSelectedDocForHistory={setSelectedDocForHistory}
          setTaggingDoc={setTaggingDoc}
          onRowClick={onRowClick}
          theme={theme}
      />
  );
  
  return (
    <div className={cn("flex-1 overflow-hidden flex flex-col", theme.surface.default, isPending ? "opacity-70 transition-opacity" : "")}>
        <div className={cn("flex items-center px-4 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            <div className="w-10 flex-shrink-0 flex justify-center">
                <input type="checkbox" onChange={selectAll} checked={isAllSelected} className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"/>
            </div>
            <div className="flex-1 cursor-pointer flex items-center" onClick={() => handleSort('title')}>Document Name <SortIcon field="title"/></div>
            <div className="w-28 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('sourceModule')}>Source <SortIcon field="sourceModule"/></div>
            <div className="w-28 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('status')}>Status <SortIcon field="status"/></div>
            <div className="w-48 flex-shrink-0">Tags & Rules</div>
            <div className="w-32 flex-shrink-0 cursor-pointer flex items-center" onClick={() => handleSort('lastModified')}>Modified <SortIcon field="lastModified"/></div>
            <div className="w-24 flex-shrink-0 text-right"></div>
        </div>
        
        <div className="flex-1 min-h-0">
             <VirtualList 
                items={sortedDocuments}
                height="100%"
                itemHeight={73} 
                renderItem={renderVirtualRow}
                emptyMessage="No documents found."
             />
        </div>
    </div>
  );
};
