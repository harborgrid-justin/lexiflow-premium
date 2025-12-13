
import React from 'react';
import { Gavel, FileText, Bookmark, Eye, ArrowUpRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { FileIcon } from '../../common/Primitives';

interface WallItemCardProps {
    item: any;
    onView: () => void;
    theme: any;
}

export const WallItemCard: React.FC<WallItemCardProps> = ({ item, onView, theme }) => {
    
    const getTypeIcon = (type: string) => {
        if (type === 'Motion') return <Gavel className="h-12 w-12 opacity-50 text-purple-500"/>;
        if (type === 'Order') return <FileText className="h-12 w-12 opacity-50 text-red-500"/>;
        return <FileIcon type={type} className="h-12 w-12 opacity-50"/>;
    };

    return (
        <div className={cn("group relative flex flex-col rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer", theme.surface.default, theme.border.default, item.hot ? "ring-2 ring-red-500/20" : "")}>
            <div className={cn("aspect-[4/3] rounded-t-xl flex items-center justify-center relative overflow-hidden", theme.surface.highlight)}>
                {getTypeIcon(item.type)}
                {item.hot && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">HOT</span>}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onView(); }} className={cn("p-2 rounded-full shadow-lg", theme.surface.default, theme.text.primary, `hover:${theme.primary.text}`)} title="View"><Eye className="h-4 w-4"/></button>
                        <button className={cn("p-2 rounded-full shadow-lg", theme.surface.default, theme.text.primary, `hover:${theme.primary.text}`)} title="Open"><ArrowUpRight className="h-4 w-4"/></button>
                        </div>
                        <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow hover:bg-blue-700 flex items-center" title="Add to Binder">
                            <Bookmark className="h-3 w-3 mr-1"/> Binder
                        </button>
                        </div>
                </div>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <span className={cn("font-mono text-[10px] font-bold px-1.5 rounded border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>{item.num.substring(0, 8)}</span>
                    {item.status === 'Admitted' && <CheckCircle className="h-3.5 w-3.5 text-green-500"/>}
                    {item.status === 'Excluded' && <AlertTriangle className="h-3.5 w-3.5 text-red-500"/>}
                </div>
                <h4 className={cn("font-bold text-sm line-clamp-2 leading-tight mb-2", theme.text.primary)}>{item.title}</h4>
                <div className="flex justify-between items-center text-xs">
                    <span className={cn(theme.text.tertiary)}>{item.type}</span>
                    <span className={cn("font-medium", (item.status === 'Admitted' || item.status === 'Filed') ? 'text-green-600' : theme.text.secondary)}>{item.status}</span>
                </div>
            </div>
        </div>
    );
};
