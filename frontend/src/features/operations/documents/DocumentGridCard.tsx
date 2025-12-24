
import React from 'react';
import { LegalDocument } from '../../../types';
import { FileIcon } from '../../common/Primitives';
import { Badge } from '../../common/Badge';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface DocumentGridCardProps {
    doc: LegalDocument;
    isSelected: boolean;
    onToggleSelection: (id: string, e: React.MouseEvent) => void;
    onPreview: (doc: LegalDocument) => void;
}

export const DocumentGridCard: React.FC<DocumentGridCardProps> = ({ doc, isSelected, onToggleSelection, onPreview }) => {
    const { theme } = useTheme();

    return (
        <div 
            onClick={(e: React.MouseEvent) => {
                if(e.ctrlKey || e.metaKey) onToggleSelection(doc.id, e);
                else onPreview(doc);
            }}
            className={cn(
                "h-full w-full border rounded-lg p-4 flex flex-col items-center justify-between cursor-pointer transition-all hover:shadow-md relative group",
                theme.surface.default,
                theme.border.default,
                isSelected ? cn("ring-2 ring-blue-500", theme.primary.light) : `hover:${theme.surface.highlight}`
            )}
        >
            <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggleSelection(doc.id, e as any)} 
                    className="rounded text-blue-600 cursor-pointer w-4 h-4"
                />
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <FileIcon type={doc.type} className="h-16 w-16 opacity-80" />
            </div>

            <div className="w-full text-center mt-3">
                <h4 className={cn("text-xs font-bold truncate px-1", theme.text.primary)} title={doc.title}>{doc.title}</h4>
                <div className="flex justify-center items-center gap-2 mt-1">
                    <span className={cn("text-[10px]", theme.text.secondary)}>{doc.fileSize || '24KB'}</span>
                    <Badge variant="neutral" className="text-[9px] px-1 py-0">{doc.status || 'Active'}</Badge>
                </div>
            </div>
        </div>
    );
};
