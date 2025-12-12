import React from 'react';
import { PleadingDocument } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualGrid } from '../common/VirtualGrid';
import { FileText, Clock } from 'lucide-react';

interface PleadingDraftsProps {
    pleadings: PleadingDocument[];
    onEdit: (doc: PleadingDocument) => void;
}

export const PleadingDrafts: React.FC<PleadingDraftsProps> = ({ pleadings, onEdit }) => {
    const { theme } = useTheme();

    const renderItem = (item: PleadingDocument) => (
        <div 
            key={item.id} 
            className="p-2 h-full w-full"
        >
            <div 
                className={cn("border rounded-lg h-full flex flex-col cursor-pointer transition-all hover:shadow-md group p-4", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}
                onClick={() => onEdit(item)}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className={cn("p-2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400")}><FileText className="h-6 w-6"/></div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium border", theme.surfaceHighlight, theme.text.secondary, theme.border.default)}>{item.status}</span>
                </div>
                <h4 className={cn("font-bold text-sm mb-1 line-clamp-2 flex-1", theme.text.primary)}>{item.title}</h4>
                <p className={cn("text-xs mb-3 font-mono opacity-70", theme.text.secondary)}>{item.caseId}</p>
                <div className={cn("mt-auto text-xs flex items-center pt-2 border-t", theme.border.light, theme.text.tertiary)}>
                    <Clock className="h-3 w-3 mr-1"/> Last edited: {item.lastAutoSaved ? new Date(item.lastAutoSaved).toLocaleDateString() : 'Just now'}
                </div>
            </div>
        </div>
    );

    return (
         <VirtualGrid 
            items={pleadings}
            height="100%"
            itemHeight={180}
            itemWidth={250}
            renderItem={renderItem}
            gap={16}
            emptyMessage="No pleadings found. Create one to get started."
        />
    );
};
