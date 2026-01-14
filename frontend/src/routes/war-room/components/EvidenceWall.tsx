/**
 * @module components/war-room/EvidenceWall
 * @category WarRoom
 * @description Visual grid of evidence, documents, and motions.
 * Supports filtering, searching, and opening items in preview windows.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Loader2 } from 'lucide-react';
import { useMemo, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';
import { useWindow } from '@/providers';
import { useTheme } from '@/theme';

// Components
import { DocumentPreviewPanel } from '@/routes/documents/components/viewer/DocumentPreviewPanel';
import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { WallItemCard } from './cards/WallItemCard';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import type { EvidenceItem, LegalDocument, Motion, WarRoomData } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EvidenceWallProps {
    /** The ID of the current case. */
    caseId: string;
    /** The comprehensive data object for the war room. */
    warRoomData: WarRoomData;
}

interface WallItem extends Record<string, unknown> {
    id: string;
    title: string;
    type: string;
    status: string;
    hot: boolean;
    party: string;
    num: string;
    desc?: string;
    original: LegalDocument | EvidenceItem | Motion;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EvidenceWall: React.FC<EvidenceWallProps> = ({ warRoomData }) => {
    // ============================================================================
    // HOOKS & CONTEXT
    // ============================================================================
    const { theme } = useTheme();
    const { openWindow } = useWindow();

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    const [isPending, startTransition] = useTransition();

    // ============================================================================
    // MEMOIZED VALUES
    // ============================================================================
    const allItems = useMemo<WallItem[]>(() => {
        const docs = (warRoomData.documents || []).map((docUnknown: unknown) => {
            const d = docUnknown as LegalDocument;
            return {
                id: d.id,
                title: d.title,
                type: d.type,
                status: d.status || 'Available',
                hot: (d.tags || []).includes('Hot') || (d.tags || []).includes('Critical'),
                party: 'Unknown',
                num: d.id,
                desc: d.content?.substring(0, 100),
                original: d
            };
        });

        const ev = (warRoomData.evidence || []).map((evidenceUnknown: unknown) => {
            const e = evidenceUnknown as EvidenceItem;
            return {
                id: e.id,
                title: e.title,
                type: e.type,
                status: e.admissibility || 'Pending',
                hot: (e.tags || []).includes('Key Doc'),
                party: 'Joint',
                num: e.id,
                desc: e.description,
                original: e
            };
        });

        const motions = (warRoomData.motions || []).map((m) => ({
            id: m.id,
            title: m.title,
            type: 'Motion',
            status: m.status,
            hot: true,
            party: 'Appellant',
            num: m.id,
            desc: `Motion Type: ${m.type}`,
            original: m
        }));

        return [...docs, ...ev, ...motions];
    }, [warRoomData]);

    // ============================================================================
    // FILTER & SEARCH
    // ============================================================================
    const { filteredItems: combinedItems, searchQuery, setSearchQuery, category: filter, setCategory: setFilter } = useFilterAndSearch<WallItem>({
        items: allItems,
        config: {
            categoryField: 'type',
            searchFields: ['title', 'desc', 'num'],
            arrayFields: []
        },
        initialCategory: 'All'
    });

    const handleFilterClick = (val: string) => {
        startTransition(() => {
            setFilter(val);
        });
    };

    const handleViewItem = (item: WallItem) => {
        const winId = `ev-wall-${item.id}`;
        openWindow(
            winId,
            `Evidence Preview: ${item.title}`,
            <div className={cn("h-full", theme.background)}>
                <DocumentPreviewPanel
                    document={{ id: item.id } as { id: string }} onViewHistory={() => { }}

                />
            </div>
        );
    };

    const filteredExhibits = combinedItems.filter((ex) => {
        const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || (ex.desc && ex.desc.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;

        if (filter === 'All') return true;
        if (filter === 'Hot Docs') return ex.hot;
        if (filter === 'Admitted') return ex.status === 'Admitted' || ex.status === 'Filed';
        if (filter === 'Motions') return ex.type === 'Motion';
        return ex.party === filter;
    });

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center gap-4 shrink-0">
                <div className="flex-1 relative">
                    <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search exhibits & filings..." className="w-full" />
                    {isPending && <div className="absolute right-12 top-1/2 -translate-y-1/2"><Loader2 className={cn("h-4 w-4 animate-spin", theme.primary.text)} /></div>}
                </div>

                <div className={cn("flex p-1 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                    {['All', 'Hot Docs', 'Admitted', 'Motions'].map(f => (
                        <button
                            key={f}
                            onClick={() => handleFilterClick(f)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                filter === f ? cn(theme.surface.default, theme.text.primary, "shadow") : cn(theme.text.secondary, `hover:${theme.text.primary}`)
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 content-start", isPending ? "opacity-70 transition-opacity" : "")}>
                {filteredExhibits.map((ex) => (
                    <WallItemCard key={ex.id} item={ex} onView={() => handleViewItem(ex)} />
                ))}

                <div className={cn("border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`)}>
                    <span className="text-2xl font-light mb-2">+</span>
                    <span className="text-xs font-medium">Add Evidence</span>
                </div>
            </div>
        </div>
    );
};
