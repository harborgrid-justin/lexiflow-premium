import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import type { JudgeProfile } from '@/types';
import { cn } from '@/utils/cn';
import { Download, ExternalLink, Gavel } from 'lucide-react';
import React from 'react';

export const StandingOrders: React.FC = () => {
    const { theme } = useTheme();

    // Fetch judge profiles from backend
    const { data: judges = [] } = useQuery<JudgeProfile[]>(
        ['analysis', 'judges'],
        () => DataService.analysis.getJudgeProfiles()
    );

    // Fetch standing orders from backend
    const { data: standingOrders = [] } = useQuery<Array<{ id: string; judgeId: string; title?: string }>>(
        ['knowledge', 'standing-orders'],
        async () => {
            try {
                return (await DataService.knowledge?.getStandingOrders?.()) || [];
            } catch (error) {
                console.warn('[StandingOrders] Failed to fetch orders:', error);
                return [];
            }
        }
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {judges.map((judge) => (
                    <Card key={judge.id} className="flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={cn("p-3 rounded-full", theme.surface.highlight, theme.text.secondary)}><Gavel className="h-6 w-6" /></div>
                            <div>
                                <h4 className={cn("font-bold text-lg", theme.text.primary)}>{judge.name}</h4>
                                <p className={cn("text-xs uppercase tracking-wide", theme.text.secondary)}>{judge.court}</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <h5 className={cn("text-xs font-bold uppercase border-b pb-1 mb-2", theme.text.tertiary, theme.border.default)}>Standing Orders</h5>
                            {standingOrders.filter((order: { id: string; judgeId: string; title?: string }) => order.judgeId === judge.id).length > 0 ? (
                                standingOrders.filter((order: { id: string; judgeId: string; title?: string }) => order.judgeId === judge.id).map((order: { id: string; judgeId: string; title?: string }) => (
                                    <div key={order.id} className={cn("flex items-center justify-between p-2 rounded border cursor-pointer group transition-colors", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
                                        <div className="flex items-center gap-2">
                                            <FileIcon />
                                            <span className={cn("text-sm font-medium group-hover:underline", theme.primary.text)}>{order.title || 'Standing Order'}</span>
                                        </div>
                                        <Download className={cn("h-4 w-4", theme.text.tertiary)} />
                                    </div>
                                ))
                            ) : (
                                <p className={cn("text-xs", theme.text.tertiary)}>No standing orders available</p>
                            )}

                            <div className={cn("mt-4 pt-4 border-t flex justify-between items-center", theme.border.default)}>
                                <span className={cn("text-xs", theme.text.secondary)}>Updated: 2 weeks ago</span>
                                <Button size="sm" variant="ghost" icon={ExternalLink}>Court Page</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const FileIcon = () => (
    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);
