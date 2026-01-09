import { useChartTheme } from '@/shared/ui/organisms/ChartHelpers';
import { Card } from '@/shared/ui/molecules/Card';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { DataProfile } from '@/types';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, AlignLeft, Calendar, CheckCircle2, Hash, Loader2 } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

/**
 * DataProfiler - React 18 optimized with React.memo
 */
export const DataProfiler = React.memo(function DataProfiler() {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();

    const { data: profiles = [], isLoading } = useQuery<DataProfile[]>(
        ['quality', 'profiles'],
        DataService.quality.getProfiles
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'numeric': return <Hash className="h-4 w-4 text-blue-500" />;
            case 'datetime': return <Calendar className="h-4 w-4 text-purple-500" />;
            default: return <AlignLeft className="h-4 w-4 text-slate-500" />;
        }
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 gap-6">
                {profiles.map((profile, idx) => (
                    <Card key={idx} noPadding>
                        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded border", theme.surface.default, theme.border.default)}>
                                    {getIcon(profile.type)}
                                </div>
                                <div>
                                    <h4 className={cn("font-bold font-mono text-sm", theme.text.primary)}>{profile.column}</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>{profile.type}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <div className="text-center">
                                    <span className={cn("block font-bold", theme.text.primary)}>{profile.unique.toLocaleString()}</span>
                                    <span className={theme.text.tertiary}>Unique</span>
                                </div>
                                <div className="text-center">
                                    <span className={cn("block font-bold", profile.nulls > 5 ? "text-red-500" : "text-green-500")}>{profile.nulls}%</span>
                                    <span className={theme.text.tertiary}>Nulls</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h5 className={cn("text-xs font-bold uppercase mb-4", theme.text.secondary)}>Value Distribution</h5>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={profile.distribution}>
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke={chartTheme.text} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={chartTheme.tooltipStyle}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {profile.distribution.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={chartTheme.colors.blue} fillOpacity={0.6 + (index * 0.1)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className={cn("p-3 border-t flex gap-4 text-xs", theme.border.default, theme.surface.highlight)}>
                            {profile.nulls === 0 ? (
                                <div className="flex items-center text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Completeness Check Passed</div>
                            ) : (
                                <div className="flex items-center text-amber-600"><AlertTriangle className="h-3 w-3 mr-1" /> Sparse Data Detected</div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
});
