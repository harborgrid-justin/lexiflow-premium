/**
 * @module components/war-room/opposition/OppositionDetail
 * @category WarRoom
 * @description Detailed view of an opposition entity, including strategic analysis,
 * case history, and intel. Integrated with backend data provider.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import {X, FileText, Gavel, Scale, Activity, Loader2} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import {DataService} from '@/services';
import {useQuery} from '@hooks/useQueryHooks.ts';

// Hooks & Context
import {useTheme} from '@/providers';

// Components
import {Button} from '@/components';
import {EmptyState} from '@/components';

// Utils & Constants
import {cn} from '@/utils';

// Types
import type {OppositionEntity} from './OppositionList';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface OppositionDetailProps {
    /** The opposition entity to display details for. */
    entity: OppositionEntity;
    /** Callback when the detail panel is closed. */
    onClose: () => void;
}

interface CaseHistoryItem {
    id: string;
    title: string;
    year: string;
    description: string;
    result: string;
    caseId?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const SectionHeader: React.FC<{ title: string; className?: string }> = ({title, className}) => {
    const {theme} = useTheme();
    return (
        <h4 className={cn("text-xs font-bold uppercase border-b pb-2", theme.text.tertiary, theme.border.default, className)}>
            {title}
        </h4>
    );
};

const CaseHistoryCard: React.FC<{ caseItem: CaseHistoryItem }> = ({caseItem}) => {
    const {theme} = useTheme();
    return (
        <div
            className={cn("p-3 rounded border transition-colors hover:border-blue-300 cursor-pointer group", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-blue-600">{caseItem.title}</span>
                <span className={cn("text-[10px]", theme.text.tertiary)}>{caseItem.year}</span>
            </div>
            <p className={cn("text-xs mb-1", theme.text.secondary)}>{caseItem.description}</p>
            <p className={cn("text-xs font-medium", theme.text.primary)}>Result: {caseItem.result}</p>
        </div>
    );
};

// ============================================================================
// CONSTANTS
// ============================================================================
const INTEL_BUTTONS = [
    {icon: FileText, label: "Publications"},
    {icon: Gavel, label: "Rulings"},
    {icon: Scale, label: "Ethics"},
    {icon: Activity, label: "Social"}
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const getAggressionScore = (aggression: OppositionEntity['aggression']): number => {
    const levels: Record<OppositionEntity['aggression'], number> = {
        High: 5,
        Medium: 3,
        Low: 1
    };
    return levels[aggression];
};

const calculateSettlementProbability = (entity: OppositionEntity): number => {
    // Simple heuristic: lower aggression and higher win rate = higher settlement probability
    const aggressionScore = getAggressionScore(entity.aggression);
    const baseProb = 50;
    const aggressionPenalty = (aggressionScore - 3) * 10;
    const winRateBonus = (entity.winRate - 50) * 0.2;

    return Math.max(0, Math.min(100, Math.round(baseProb - aggressionPenalty + winRateBonus)));
};

// ============================================================================
// COMPONENT
// ============================================================================
export const OppositionDetail: React.FC<OppositionDetailProps> = ({entity, onClose}) => {
    const {theme} = useTheme();

    // Fetch case history for this entity from the backend
    const {data: caseHistory = [], isLoading: historyLoading} = useQuery<CaseHistoryItem[]>(
        ['opposition', 'caseHistory', entity.id],
        async () => {
            // Try to get case history from the backend
            try {
                const history = await DataService.warRoom.getOppositionCaseHistory?.(entity.id);
                return history || [];
            } catch (error) {
                console.warn('Case history unavailable:', error);
                return [];
            }
        },
        {
            enabled: !!entity.id,
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    );

    const renderAggressionIndex = () => {
        const score = getAggressionScore(entity.aggression);

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "w-2 h-4 rounded-sm transition-colors",
                            level <= score ? "bg-red-500" : "bg-slate-200"
                        )}
                    />
                ))}
            </div>
        );
    };

    const settlementProbability = calculateSettlementProbability(entity);

    return (
        <div
            className={cn("w-96 border-l flex flex-col shadow-xl animate-in slide-in-from-right duration-300 z-10", theme.surface.default, theme.border.default)}>
            {/* Header */}
            <div
                className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>
                    Entity Dossier
                </h4>
                <button
                    onClick={onClose}
                    className={cn("p-1 rounded hover:bg-slate-200 transition-colors", theme.text.tertiary)}
                    aria-label="Close dossier"
                >
                    <X className="h-4 w-4"/>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Profile Summary */}
                <div className="text-center">
                    <div className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2 shadow-md text-white bg-slate-800",
                        theme.border.default
                    )}>
                        {entity.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>{entity.name}</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>
                        {entity.role} at {entity.firm}
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
            <span className={cn(
                "text-xs px-2 py-1 rounded font-medium border",
                theme.surface.highlight,
                theme.text.secondary,
                theme.border.default
            )}>
              {entity.status}
            </span>
                    </div>
                </div>

                {/* Strategic Analysis */}
                <section className="space-y-4">
                    <SectionHeader title="Strategic Analysis"/>
                    <div
                        className={cn("p-4 rounded-lg border space-y-3", theme.surface.highlight, theme.border.default)}>
                        <div className="flex justify-between items-center">
              <span className={cn("text-xs font-medium", theme.text.secondary)}>
                Aggression Index
              </span>
                            {renderAggressionIndex()}
                        </div>
                        <div className="flex justify-between items-center">
              <span className={cn("text-xs font-medium", theme.text.secondary)}>
                Settlement Probability
              </span>
                            <span
                                className={cn("text-sm font-bold", theme.text.primary)}>{settlementProbability}%</span>
                        </div>
                        <div className="flex justify-between items-center">
              <span className={cn("text-xs font-medium", theme.text.secondary)}>
                Win Rate vs Firm
              </span>
                            <span className={cn("text-sm font-bold", theme.text.primary)}>{entity.winRate}%</span>
                        </div>
                    </div>
                    {entity.notes && (
                        <p className={cn("text-sm leading-relaxed italic px-1", theme.text.secondary)}>
                            "{entity.notes}"
                        </p>
                    )}
                </section>

                {/* Case History */}
                <section className="space-y-4">
                    <SectionHeader title="Case History"/>
                    {historyLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600"/>
                        </div>
                    ) : caseHistory.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No case history"
                            description="No prior cases found for this entity."
                            className="py-6"
                        />
                    ) : (
                        <div className="space-y-3">
                            {caseHistory.map((caseItem) => (
                                <CaseHistoryCard key={caseItem.id} caseItem={caseItem}/>
                            ))}
                        </div>
                    )}
                </section>

                {/* Intel Actions */}
                <section className="space-y-4">
                    <SectionHeader title="Intel"/>
                    <div className="grid grid-cols-2 gap-3">
                        {INTEL_BUTTONS.map(({icon: Icon, label}) => (
                            <Button
                                key={label}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Icon className="h-3 w-3 mr-1"/>
                                {label}
                            </Button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className={cn("p-4 border-t flex gap-2", theme.surface.highlight, theme.border.default)}>
                <Button variant="outline" className="flex-1">
                    Flag Risk
                </Button>
                <Button variant="primary" className="flex-1">
                    View Full Profile
                </Button>
            </div>
        </div>
    );
};
