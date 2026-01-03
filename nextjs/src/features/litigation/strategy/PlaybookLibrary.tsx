/**
 * @module components/litigation/PlaybookLibrary
 * @category Litigation
 * @description Playbook library with templates for litigation strategies.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { CheckCircle, Globe, Layers, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '@/providers';
import { useWindow } from '@/providers';

// Components
import { VirtualGrid } from '@/components/organisms/VirtualGrid';
import { PlaybookDetail } from './PlaybookDetail';

// Utils & Constants
import { Playbook } from '@/api/types/mockLitigationPlaybooks';
import { cn } from '@/utils/cn';
import { extractCategories, filterPlaybooks, getDifficultyBorderColor, getDifficultyColor } from './utils';

// Types
import { PlaybookLibraryProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

export const PlaybookLibrary: React.FC<PlaybookLibraryProps> = ({ onApply }) => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

    // Fetch playbooks from backend API
    const { data: playbooks = [], isLoading } = useQuery<Playbook[]>(
        queryKeys.playbooks.all(),
        () => DataService.playbooks.getAll()
    );

    const categories = extractCategories(playbooks);

    const filteredPlaybooks = useMemo(() =>
        filterPlaybooks(playbooks, searchTerm, selectedCategory, selectedDifficulty),
        [playbooks, searchTerm, selectedCategory, selectedDifficulty]
    );

    const handleOpenPlaybook = (pb: Playbook) => {
        const winId = `playbook-${pb.id}`;
        openWindow(
            winId,
            `Strategy: ${pb.title}`,
            <PlaybookDetail playbook={pb} onClose={() => closeWindow(winId)} onApply={(p) => { onApply(p); closeWindow(winId); }} />
        );
    };

    const renderPlaybookCard = (pb: Playbook) => (
        <div className="p-3 h-full">
            <div
                className={cn(
                    "group flex flex-col h-full rounded-xl border shadow-sm transition-all hover:shadow-lg cursor-pointer bg-white dark:bg-slate-900 relative overflow-hidden",
                    theme.border.default
                )}
                onClick={() => handleOpenPlaybook(pb)}
            >
                <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", getDifficultyBorderColor(pb.difficulty))}></div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", theme.surface.highlight, theme.text.secondary)}>
                            {pb.category}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", getDifficultyColor(pb.difficulty))}>
                            {pb.difficulty}
                        </span>
                    </div>

                    <h3 className={cn("font-bold text-lg mb-2 line-clamp-2", theme.text.primary)}>{pb.title}</h3>
                    <p className={cn("text-sm line-clamp-3 mb-4 flex-1", theme.text.secondary)}>{pb.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {pb.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={cn("text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>#{tag}</span>
                        ))}
                    </div>

                    {pb.readiness && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                                <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {pb.status || 'Ready'}</span>
                                <span className={theme.text.primary}>{pb.readiness}%</span>
                            </div>
                            <div className={cn("w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800")}>
                                <div className="h-full bg-green-500" style={{ width: `${pb.readiness}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.default)}>
                        <div className={cn("flex items-center gap-3 text-xs", theme.text.tertiary)}>
                            <span className="flex items-center"><Globe className="h-3 w-3 mr-1" /> {pb.jurisdiction}</span>
                            <span className="flex items-center"><Layers className="h-3 w-3 mr-1" /> {pb.phases} Phs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Filters Header */}
            <div className={cn("p-4 border-b space-y-4 shrink-0", theme.surface.default, theme.border.default)}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme.text.tertiary)} />
                        <input
                            className={cn("w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surface.highlight, theme.border.default, theme.text.primary)}
                            placeholder="Search 50+ litigation strategies..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <select
                            title="Filter by category"
                            className={cn("px-3 py-2 rounded-lg border text-sm outline-none min-w-[140px]", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={selectedCategory}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                            disabled={isLoading}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            title="Filter by difficulty"
                            className={cn("px-3 py-2 rounded-lg border text-sm outline-none min-w-[140px]", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={selectedDifficulty}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDifficulty(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="All">All Difficulties</option>
                            <option value="Low">Low Complexity</option>
                            <option value="Medium">Medium Complexity</option>
                            <option value="High">High Complexity</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-hidden p-4 bg-slate-50 dark:bg-black/20">
                {isLoading ? (
                    <div className={cn("flex items-center justify-center h-full", theme.text.secondary)}>
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Loading playbooks...</p>
                        </div>
                    </div>
                ) : (
                    <VirtualGrid
                        items={filteredPlaybooks}
                        itemHeight={340}
                        itemWidth={320}
                        height="100%"
                        gap={16}
                        renderItem={(item: unknown) => renderPlaybookCard(item as Playbook)}
                        emptyMessage="No playbooks match your criteria."
                    />
                )}
            </div>
        </div>
    );
};

export default PlaybookLibrary;
