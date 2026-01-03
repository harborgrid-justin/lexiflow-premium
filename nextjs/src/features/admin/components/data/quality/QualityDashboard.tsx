import { VirtualList } from '@/components/organisms/VirtualList';
import { Button } from '@/components/ui/atoms/Button';
import { Card } from '@/components/ui/molecules/Card';
import { useNotify } from '@/hooks/core';
import { queryClient, useMutation } from '@/hooks/backend';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { DataAnomaly, QualityMetricHistory } from '@/types';
import { cn } from '@/utils/cn';
import { queryKeys } from '@/utils/queryKeys';
import { AlertOctagon, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface QualityDashboardProps {
    anomalies: DataAnomaly[];
    history: QualityMetricHistory[];
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({ anomalies, history }) => {
    const { theme } = useTheme();
    const notify = useNotify();

    const { mutate: fixAnomaly } = useMutation(
        DataService.quality.applyFix,
        {
            onMutate: async (id: number) => {
                await queryClient.invalidate(queryKeys.quality.anomalies());
                const previousAnomalies = queryClient.getQueryState<DataAnomaly[]>(['admin', 'anomalies'])?.data || [];

                queryClient.setQueryData<DataAnomaly[]>(['admin', 'anomalies'], old =>
                    (old || []).map(a => a.id === id ? { ...a, status: 'Fixing' } : a)
                );

                return { previousAnomalies };
            },
            onError: (_err, id, context) => {
                if (context?.previousAnomalies) {
                    queryClient.setQueryData(['admin', 'anomalies'], context.previousAnomalies);
                }
                notify.error(`Failed to fix anomaly #${id}.`);
            },
            onSettled: () => {
                queryClient.invalidate(queryKeys.quality.anomalies());
            },
        }
    );

    const handleFix = (id: number) => {
        fixAnomaly(id);
    };

    const renderAnomalyRow = (a: DataAnomaly) => (
        <div key={a.id} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 transition-colors gap-3", theme.border.default, `hover:${theme.surface.highlight}`)} style={{ height: 'auto', minHeight: '73px' }}>
            <div className="flex items-start sm:items-center gap-4 flex-1">
                <div className={cn("p-2 rounded-full shrink-0", a.status === 'Fixed' ? cn(theme.status.success.bg, theme.status.success.text) : cn(theme.status.warning.bg, theme.status.warning.text))}>
                    {a.status === 'Fixed' ? <CheckCircle2 className="h-5 w-5" /> : <AlertOctagon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                    <h4 className={cn("font-bold text-sm flex items-center gap-2 truncate", theme.text.primary)}>
                        {a.table}.{a.field}
                        {a.status === 'Fixing' && <RefreshCw className={cn("h-3 w-3 animate-spin", theme.primary.text)} />}
                    </h4>
                    <p className={cn("text-xs truncate", theme.text.secondary)}>{a.issue} • <span className={cn("font-mono px-1 rounded", theme.surface.highlight)}>{a.count} rows</span></p>
                </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className={cn("text-xs font-mono px-2 py-1 rounded border hidden md:block truncate max-w-[150px]", theme.surface.highlight, theme.border.default, theme.text.tertiary)}>Sample: {a.sample}</span>
                {a.status === 'Detected' && (
                    <Button size="sm" variant="outline" icon={Check} onClick={() => handleFix(a.id)}>Fix</Button>
                )}
                {a.status === 'Fixed' && <span className={cn("text-xs font-bold uppercase", theme.status.success.text)}>Resolved</span>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Overall Health</p>
                    <div className="flex items-center mt-2">
                        <div className={cn("text-3xl font-bold mr-3", theme.status.success.text)}>94%</div>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>Good</span>
                    </div>
                </div>
                <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Critical Errors</p>
                    <div className="flex items-center mt-2">
                        <div className={cn("text-3xl font-bold mr-3", theme.status.error.text)}>{anomalies.filter(a => a.status === 'Detected').length}</div>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}>Action Required</span>
                    </div>
                </div>
                <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Rows Scanned</p>
                    <div className="flex items-center mt-2">
                        <div className={cn("text-3xl font-bold mr-3", theme.primary.text)}>1.2M</div>
                        <span className={cn("text-xs", theme.text.secondary)}>Last: Just now</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Anomaly Detection Log" noPadding>
                    <div className="h-[400px]">
                        <VirtualList
                            items={anomalies}
                            height="100%"
                            itemHeight={73}
                            renderItem={renderAnomalyRow}
                        />
                    </div>
                </Card>

                <Card title="Quality Trends (90 Days)">
                    <div className="h-[400px] w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
