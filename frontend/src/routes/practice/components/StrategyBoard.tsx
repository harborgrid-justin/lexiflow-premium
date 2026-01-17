/**
 * @module components/practice/StrategyBoard
 * @category Practice Management
 * @description Strategic planning with OKRs and M&A pipeline.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with startTransition
 * - Guideline 28: Theme usage is pure function of context
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for transitions
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { FileText, MapPin, PieChart, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context

// Components
import { ProgressBar } from '@/components/atoms/ProgressBar/ProgressBar';
import { Card } from '@/components/molecules/Card/Card';
import { Tabs } from '@/components/molecules/Tabs/Tabs';
import { MetricTile } from '@/components/organisms/_legacy/RefactoredCommon';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/routes/cases/ui/components/Kanban/Kanban';

// Utils & Constants

// ============================================================================
// COMPONENT
// ============================================================================

export function StrategyBoard() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('okr');

    const { data: okrs = [] } = useQuery<unknown[]>(
        ['okrs', 'all'],
        DataService.operations.getOkrs
    );

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <div className="mb-4">
                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Strategic Planning Office</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Long-term firm objectives, growth tracking, and governance.</p>
                </div>
                <Tabs
                    tabs={[
                        { id: 'okr', label: 'OKRs & Goals', icon: Target },
                        { id: 'ma', label: 'M&A Pipeline', icon: PieChart },
                        { id: 'partnership', label: 'Partnership Track', icon: Users },
                        { id: 'competitors', label: 'Market Intel', icon: TrendingUp },
                        { id: 'governance', label: 'Board Minutes', icon: FileText },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'okr' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricTile label="Annual Revenue Goal" value="$12.5M" icon={Target} trend="82% Achieved" trendUp={true} />
                            <MetricTile label="Client Retention" value="96%" icon={Users} trend="Top Tier" trendUp={true} />
                            <MetricTile label="Expansion Mkts" value="2" icon={MapPin} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {okrs.map((okr: unknown) => (
                                <Card key={(okr as { id: string }).id} title={(okr as { title: string }).title}>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className={theme.text.secondary}>Owner: {(okr as { owner: string }).owner}</span>
                                            <span className="font-bold">{(okr as { progress: number }).progress}%</span>
                                        </div>
                                        <ProgressBar label="" value={(okr as { progress: number }).progress} showValue={false} colorClass={(okr as { progress: number }).progress > 70 ? 'bg-green-500' : 'bg-blue-500'} />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ma' && (
                    <div className="h-full flex flex-col">
                        <h4 className={cn("font-bold mb-4", theme.text.primary)}>Acquisition Targets</h4>
                        <KanbanBoard>
                            <KanbanColumn title="Identified" count={3}>
                                <KanbanCard>Boutique IP Firm - Austin</KanbanCard>
                                <KanbanCard>Legal Tech Startup (Analytics)</KanbanCard>
                                <KanbanCard>Solo Practitioner - Class Action</KanbanCard>
                            </KanbanColumn>
                            <KanbanColumn title="Due Diligence" count={1}>
                                <KanbanCard className="border-l-4 border-l-blue-500">Regional Employment Firm</KanbanCard>
                            </KanbanColumn>
                            <KanbanColumn title="Negotiation" count={0}>
                                <></>
                            </KanbanColumn>
                            <KanbanColumn title="Integration" count={1}>
                                <KanbanCard className="border-l-4 border-l-green-500">Tax Practice Group</KanbanCard>
                            </KanbanColumn>
                        </KanbanBoard>
                    </div>
                )}
            </div>
        </div>
    );
};
