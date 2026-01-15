/**
 * @module components/war-room/cards/WallItemCard
 * @category WarRoom
 * @description Card component for displaying evidence items on the wall.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Gavel, FileText, Bookmark, Eye, ArrowUpRight, CheckCircle, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Components
import { FileIcon } from '@/components/atoms/FileIcon';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/** Wall item for visual wall display */
interface WallItem {
    id: string;
    type: string;
    title: string;
    date?: string;
    hot?: boolean;
    num?: string;
    status?: string;
}

interface WallItemCardProps {
    /** The wall item data to display. */
    item: WallItem;
    /** Callback when the view button is clicked. */
    onView: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const WallItemCard: React.FC<WallItemCardProps> = ({ item, onView }) => {
    const { theme } = useTheme();

    const getTypeIcon = (type: string) => {
        if (type === 'Motion') return <Gavel className="h-12 w-12 opacity-50 text-purple-500"/>;
        if (type === 'Order') return <FileText className="h-12 w-12 opacity-50 text-rose-500"/>;
        return <FileIcon type={type} className="h-12 w-12 opacity-50"/>;
    };

    return (
        <div className={cn("group relative flex flex-col rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer", theme.surface.default, theme.border.default, item.hot ? "ring-2 ring-rose-500/20" : "")}>
            <div className={cn("aspect-[4/3] rounded-t-xl flex items-center justify-center relative overflow-hidden", theme.surface.highlight)}>
                {getTypeIcon(item.type)}
                {item.hot && <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">HOT</span>}

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-2">
                        <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); onView(); }} className={cn("p-2 rounded-full shadow-lg transition-colors", theme.surface.default, theme.text.primary, `hover:${theme.primary.text}`)} title="View"><Eye className="h-4 w-4"/></button>
                        <button className={cn("p-2 rounded-full shadow-lg transition-colors", theme.surface.default, theme.text.primary, `hover:${theme.primary.text}`)} title="Open"><ArrowUpRight className="h-4 w-4"/></button>
                        </div>
                        <div className="flex gap-2 mt-2">
                        <button className={cn("px-3 py-1 text-white text-[10px] font-bold rounded-full shadow flex items-center transition-colors", theme.primary.DEFAULT, `hover:${theme.primary.hover}`)} title="Add to Binder">
                            <Bookmark className="h-3 w-3 mr-1"/> Binder
                        </button>
                        </div>
                </div>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    {item.num && <span className={cn("font-mono text-[10px] font-bold px-1.5 rounded border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>{item.num.substring(0, 8)}</span>}
                    {item.status === 'Admitted' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500"/>}
                    {item.status === 'Excluded' && <AlertTriangle className="h-3.5 w-3.5 text-rose-500"/>}
                </div>
                <h4 className={cn("font-bold text-sm line-clamp-2 leading-tight mb-2", theme.text.primary)}>{item.title}</h4>
                <div className="flex justify-between items-center text-xs">
                    <span className={cn(theme.text.tertiary)}>{item.type}</span>
                    {item.status && <span className={cn("font-medium", (item.status === 'Admitted' || item.status === 'Filed') ? 'text-emerald-600' : theme.text.secondary)}>{item.status}</span>}
                </div>
            </div>
        </div>
    );
};
