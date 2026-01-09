import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { TagList } from '@/components/ui/molecules/TagList/TagList';
import { LegalDocument } from '@/types';
import { cn } from '@/shared/lib/cn';
import { Book, CheckSquare, Clock, Download, Eye, MoreVertical, Tag } from 'lucide-react';
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

    const handleHistory = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedDocForHistory(doc);
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
            className={cn("flex items-center h-full cursor-pointer select-none", isSelected ? "bg-primary-light" : '')}
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
                <div className={cn("p-2 rounded-lg mr-3 border transition-colors bg-surface border-border group-hover:border-border")}>
                    <FileIcon type={doc.type} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <div className={cn("text-sm font-bold transition-colors truncate max-w-xs text-text group-hover:text-primary")}>{doc.title}</div>
                    <div className={cn("text-xs mt-0.5 text-text-muted")}>{doc.type} • {doc.fileSize}</div>
                </div>
            </div>
            <div className="w-28 flex-shrink-0">
                <Badge variant={doc.sourceModule === 'Evidence' ? 'warning' : doc.sourceModule === 'Discovery' ? 'info' : 'neutral'}>
                    {doc.sourceModule}
                </Badge>
            </div>
            <div className="w-28 flex-shrink-0">
                {doc.status === 'Signed' ? (
                    <span className={cn("flex items-center text-xs font-bold px-2 py-1 rounded w-fit bg-success/10 text-success")}><CheckSquare className="h-3 w-3 mr-1" /> Signed</span>
                ) : doc.status === 'Draft' ? (
                    <span className={cn("flex items-center text-xs px-2 py-1 rounded w-fit bg-slate-100 text-slate-600")}><Clock className="h-3 w-3 mr-1" /> Draft</span>
                ) : (
                    <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded w-fit bg-primary-light text-primary")}>Final</span>
                )}
            </div>
            <div className="w-48 flex-shrink-0">
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1 items-center">
                        <TagList tags={[...doc.tags]} limit={2} />
                        <button
                            onClick={handleTagging}
                            className={cn("opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-text-muted hover:bg-surface hover:text-primary")}
                        >
                            <Tag className="h-3 w-3" />
                        </button>
                    </div>
                    {doc.linkedRules && doc.linkedRules.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Book className="h-3 w-3 text-purple-400" />
                            <span className="text-[10px] text-purple-600 font-medium truncate max-w-[100px]">{doc.linkedRules.join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={cn("w-32 flex-shrink-0 whitespace-nowrap text-sm text-text-muted")}>
                {doc.lastModified}
            </div>
            <div className="w-24 flex-shrink-0 flex justify-end">
                <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <button className={cn("p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-light")}><Download className="h-4 w-4" /></button>
                    <button onClick={handleHistory} className={cn("p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-light")} title="View History"><Eye className="h-4 w-4" /></button>
                    <button className={cn("p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-light")}><MoreVertical className="h-4 w-4" /></button>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.doc === next.doc && prev.isSelected === next.isSelected;
});
DocumentRow.displayName = 'DocumentRow';
