/**
 * @module components/war-room/WitnessPrep
 * @category WarRoom
 * @description Component for managing witness preparation, including status tracking,
 * examination outlines, and exhibit bundles.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ArrowLeft, FileText, Link as LinkIcon, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useModalState } from '@/hooks/core';
import { useTheme } from '@/theme';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { UserAvatar } from '@/shared/ui/atoms/UserAvatar/UserAvatar';
import { Card } from '@/shared/ui/molecules/Card/Card';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import type { WarRoomData } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface WitnessPrepProps {
    /** The ID of the current case. */
    caseId: string;
    /** The comprehensive data object for the war room. */
    warRoomData: WarRoomData;
    /** Optional pre-selected witness ID to display initially. */
    initialWitnessId?: string | null;
    /** Callback when witness selection is cleared. */
    onClearSelection?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WitnessPrep({ caseId: _caseId, warRoomData, initialWitnessId, onClearSelection }: WitnessPrepProps) {
    // ============================================================================
    // HOOKS & CONTEXT
    // ============================================================================
    const { theme } = useTheme();

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    const [selectedWitnessId, setSelectedWitnessId] = useState<string | null>(initialWitnessId || null);
    const [outline, setOutline] = useState('1. Introduction\n2. Background\n3. Key Events\n   - ...');
    const linkModal = useModalState();

    // ============================================================================
    // MEMOIZED VALUES
    // ============================================================================
    const witnesses = useMemo(() => {
        return (warRoomData.witnesses || []).map((p: unknown) => ({
            id: (p as { id: string }).id,
            name: (p as { name: string }).name,
            role: (p as { role: string }).role,
            status: 'Available',
            scheduled: 'TBD',
            prep: 0,
            linkedExhibits: []
        }));
    }, [warRoomData]);

    // ============================================================================
    // EFFECTS
    // ============================================================================
    useEffect(() => {
        if (initialWitnessId) setSelectedWitnessId(initialWitnessId);
    }, [initialWitnessId]);

    const activeWitness = witnesses.find((w) => w.id === selectedWitnessId);

    const handleCloseDetail = () => {
        setSelectedWitnessId(null);
        if (onClearSelection) onClearSelection();
    };

    if (activeWitness) {
        return (
            <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right duration-300">
                {/* Witness Header */}
                <div className={cn("flex justify-between items-start p-6 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <div className="flex items-center gap-6">
                        <button onClick={handleCloseDetail} title="Go back to witness list" className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}>
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <UserAvatar name={activeWitness.name} size="xl" />
                        <div>
                            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{activeWitness.name}</h2>
                            <div className={cn("flex items-center gap-3 mt-1 text-sm", theme.text.secondary)}>
                                <span className={cn("font-medium px-2 py-0.5 rounded border", theme.surface.highlight, theme.border.default)}>{activeWitness.role}</span>
                                <span>Scheduled: {activeWitness.scheduled}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={cn("text-xs font-bold uppercase mb-1", theme.text.tertiary)}>Prep Status</div>
                        <div className={cn("text-2xl font-bold", theme.text.tertiary)}>{activeWitness.prep}%</div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                    {/* Left: Examination Outline */}
                    <Card title="Examination Outline" className="flex flex-col h-full">
                        <div className="flex-1 relative">
                            <textarea
                                className={cn("w-full h-full p-4 resize-none outline-none font-serif text-base leading-relaxed border rounded-md", theme.surface.default, theme.border.default, theme.text.primary)}
                                value={outline}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOutline(e.target.value)}
                                placeholder="Draft your questions here..."
                            />
                        </div>
                    </Card>

                    {/* Right: Exhibit Bundle */}
                    <Card title="Witness Bundle (Exhibits)" action={<Button size="sm" variant="outline" icon={Plus} onClick={() => linkModal.open()}>Link Exhibit</Button>} className="flex flex-col h-full">
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                            <div className={cn("text-center py-8 italic", theme.text.tertiary)}>No exhibits linked yet.</div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {witnesses.map((w) => (
                    <Card key={w.id} noPadding className={cn("flex flex-col border-l-4 cursor-pointer hover:shadow-md transition-all border-l-slate-300")}>
                        <div className="p-5 flex justify-between items-start" onClick={() => setSelectedWitnessId(w.id)}>
                            <div className="flex items-center gap-4">
                                <UserAvatar name={w.name} size="lg" />
                                <div className="min-w-0">
                                    <h4 className={cn("font-bold text-lg truncate", theme.text.primary)}>{w.name}</h4>
                                    <p className={cn("text-sm truncate", theme.text.secondary)}>{w.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-4 space-y-3" onClick={() => setSelectedWitnessId(w.id)}>
                            <div className="space-y-1">
                                <div className={cn("flex justify-between text-xs", theme.text.secondary)}>
                                    <span>Prep Completion</span>
                                    <span className="font-bold">{w.prep}%</span>
                                </div>
                                <div className={cn("w-full h-1.5 rounded-full", theme.surface.highlight)}>
                                    <div className={cn("h-1.5 rounded-full transition-all bg-blue-500")} style={{ width: `${w.prep}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("p-3 border-t flex gap-2", theme.surface.highlight, theme.border.default)} onClick={e => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="flex-1 text-xs" icon={FileText} onClick={() => setSelectedWitnessId(w.id)}>Outline</Button>
                            <Button size="sm" variant="ghost" className="flex-1 text-xs" icon={LinkIcon} onClick={() => setSelectedWitnessId(w.id)}>Exhibits</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}