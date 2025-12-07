
import React, { useState } from 'react';
import { Target, TrendingUp, Users, PieChart, FileText } from 'lucide-react';
import { Tabs } from '../common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { MetricTile } from '../common/RefactoredCommon';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

export const StrategyBoard: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('okr');

    const okrs = [
        { id: 1, title: 'Expand into IP Litigation', progress: 65, owner: 'Partner Committee' },
        { id: 2, title: 'Increase Profit Margin by 5%', progress: 40, owner: 'Finance' },
        { id: 3, title: 'Launch AI Defense Practice', progress: 85, owner: 'Innovation Team' },
    ];

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
                             {okrs.map(okr => (
                                 <Card key={okr.id} title={okr.title}>
                                     <div className="space-y-2">
                                         <div className="flex justify-between text-sm">
                                             <span className={theme.text.secondary}>Owner: {okr.owner}</span>
                                             <span className="font-bold">{okr.progress}%</span>
                                         </div>
                                         <ProgressBar label="" value={okr.progress} showValue={false} colorClass={okr.progress > 70 ? 'bg-green-500' : 'bg-blue-500'} />
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
                            {/* FIX: Added null child to satisfy required children prop. */}
                            <KanbanColumn title="Negotiation" count={0}>{null}</KanbanColumn>
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

// Helper Icon for local usage
const MapPin = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
