import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';
import { Card } from '@/components/ui/molecules/Card/Card';
import { MetricCard } from '@/components/ui/molecules/MetricCard/MetricCard';
import { useQuery } from '@/hooks/backend';
import { useInterval } from '@/hooks/core';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { TenantConfig } from '@/types';
import { cn } from '@/utils/cn';
import { Activity, Database, HardDrive, Server } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * PlatformOverview - React 18 optimized with React.memo
 */
export const PlatformOverview = React.memo(function PlatformOverview() {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();

    const { data: tenantConfig } = useQuery<TenantConfig>(
        ['admin', 'tenant'],
        () => DataService.admin.getTenantConfig(),
        { initialData: { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' } }
    );

    // Initialize with empty array or static placeholder to ensure deterministic first render
    const [data, setData] = useState<{ time: number; value: number }[]>([]);

    // Hydrate with random simulation data after mount
    useEffect(() => {
        setData(Array.from({ length: 40 }, (_, i) => ({
            time: i, value: Math.floor(Math.random() * 500) + 200
        })));
    }, []);

    // Update chart every second to simulate live monitoring
    useInterval(() => {
        setData(currentData => {
            if (currentData.length === 0) return currentData;
            const nextTime = currentData[currentData.length - 1].time + 1;
            // Random walk logic for somewhat realistic look
            const prevValue = currentData[currentData.length - 1].value;
            const delta = Math.floor(Math.random() * 100) - 50;
            const nextValue = Math.max(100, Math.min(900, prevValue + delta));

            return [...currentData.slice(1), { time: nextTime, value: nextValue }];
        });
    }, 1000);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Data Infrastructure</h2>
                <div className="flex gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>Production</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", theme.status.info.bg, theme.status.info.text, theme.status.info.border)}>{tenantConfig?.region}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard label="Total Records" value="2.4M" icon={Database} className="border-l-4 border-l-blue-600" />
                <MetricCard label="Throughput" value="1.2GB/s" icon={Activity} className="border-l-4 border-l-green-600" trend="+15%" trendUp={true} isLive={true} />
                <MetricCard label="Storage Used" value="450TB" icon={HardDrive} className="border-l-4 border-l-purple-600" />
                <MetricCard label="Active Nodes" value="12" icon={Server} className="border-l-4 border-l-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Live Query Traffic (QPS)" className="lg:col-span-2 overflow-hidden">
                    <div className="h-64 w-full min-w-0 relative overflow-hidden">
                        <ResponsiveContainer width="99%" height="100%" minWidth={0} debounce={50}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={chartTheme.colors.primary}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorVal)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="System Health">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className={cn("text-sm", theme.text.secondary)}>Master DB (Postgres)</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={cn("text-sm", theme.text.secondary)}>Search Cluster (Elastic)</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={cn("text-sm", theme.text.secondary)}>Redis Cache</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.warning.bg, theme.status.warning.text)}>Warn (High Mem)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={cn("text-sm", theme.text.secondary)}>Vector Store (Pinecone)</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
});

export default PlatformOverview;
