import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { TagList } from '@/components/ui/molecules/TagList/TagList';
import { cn } from '@/lib/utils';
import { LegalDocument } from '@/types/documents';
import { Book, CheckSquare, Clock, Tag } from 'lucide-react';
import React from 'react';

interface DocumentRowProps {
  doc: LegalDocument;
  isSelected: boolean;
  toggleSelection: (id: string, event?: React.MouseEvent | React.ChangeEvent) => void;
  setSelectedDocForHistory: (doc: LegalDocument) => void;
  setTaggingDoc: (doc: LegalDocument) => void;
  onRowClick?: (doc: LegalDocument) => void;
}

export const DocumentRow = React.memo<DocumentRowProps>(({
  doc, isSelected, toggleSelection, setSelectedDocForHistory, setTaggingDoc, onRowClick
}) => {

  const handleSelection = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    toggleSelection(doc.id, e);
  };

  const handleTagging = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTaggingDoc(doc);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      toggleSelection(doc.id, e);
    } else if (onRowClick) {
      onRowClick(doc);
    } else {
      toggleSelection(doc.id, e);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center h-[72px] cursor-pointer select-none border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group",
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-slate-900"
      )}
      onClick={handleClick}
    >
      <div className="w-10 flex-shrink-0 flex justify-center" onClick={handleSelection}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelection}
          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0 flex items-center pr-4">
        <div className="p-2 rounded-lg mr-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
          <FileIcon type={doc.type} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">{doc.title}</div>
          <div className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">{doc.type} • {doc.fileSize}</div>
        </div>
      </div>
      <div className="w-28 flex-shrink-0">
        <Badge variant={doc.sourceModule === 'Evidence' ? 'warning' : doc.sourceModule === 'Discovery' ? 'info' : 'neutral'}>
          {doc.sourceModule || 'General'}
        </Badge>
      </div>
      <div className="w-28 flex-shrink-0">
        {doc.status === 'Signed' ? (
          <span className="flex items-center text-xs font-bold px-2 py-1 rounded w-fit bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckSquare className="h-3 w-3 mr-1" /> Signed
          </span>
        ) : doc.status === 'Draft' ? (
          <span className="flex items-center text-xs px-2 py-1 rounded w-fit bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <Clock className="h-3 w-3 mr-1" /> Draft
          </span>
        ) : (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded w-fit bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Final
          </span>
        )}
      </div>
      <div className="w-48 flex-shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1 items-center">
            <TagList tags={[...(doc.tags || [])]} limit={2} />
            <button
              onClick={handleTagging}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
            >
              <Tag className="h-3 w-3" />
            </button>
          </div>
          {doc.linkedRules && doc.linkedRules.length > 0 && (
            <div className="flex items-center gap-1">
              <Book className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[100px]">{doc.linkedRules.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-32 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
        {new Date(doc.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
});

DocumentRow.displayName = 'DocumentRow';
