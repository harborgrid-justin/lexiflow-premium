import { Activity, Database, HardDrive, Server } from 'lucide-react';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';
import { useQuery } from '@/hooks/backend';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { adminApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import { type TenantConfig } from '@/types';


/**
 * PlatformOverview - React 18 optimized with React.memo
 */
export const PlatformOverview = React.memo(function PlatformOverview() {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();

    // Tenant Config
    const { data: tenantConfig } = useQuery<TenantConfig>(
        ['admin', 'tenant'],
        () => DataService.admin.getTenantConfig(),
        { initialData: { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' } }
    );

    // Real System Metrics
    const { data: metrics, isLoading: isLoadingMetrics } = useQuery(
        ['admin', 'metrics', 'current'],
        () => adminApi.metrics.getCurrent(),
        { refetchInterval: 5000 }
    );

    // Real System History for Chart
    const { data: historyMetrics = [] } = useQuery(
        ['admin', 'metrics', 'history'],
        () => {
            const end = new Date();
            const start = new Date(end.getTime() - 3600000); // 1 hour
            return adminApi.metrics.getHistory(start.toISOString(), end.toISOString(), '5m');
        },
        { refetchInterval: 30000 }
    );

    // Real System Health
    const { data: health } = useQuery(
        ['admin', 'health'],
        () => adminApi.health.check(),
        { refetchInterval: 10000 }
    );

    // Transform history data for chart
    const chartData = React.useMemo(() => {
        if (!Array.isArray(historyMetrics)) return [];
        return historyMetrics.map(m => ({
            time: new Date(m.timestamp).getTime(),
            value: m.application?.requestsPerMinute ?? 0
        }));
    }, [historyMetrics]);

    // Helper to get component status
    /* const getComponentStatus = (name: string) => {
        const check = health?.checks?.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
        return check?.status === 'pass' ? 'healthy' : check?.status === 'warn' ? 'warning' : 'unhealthy';
    }; */

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
                <MetricCard
                    label="DB Connections"
                    value={isLoadingMetrics ? "..." : (metrics?.database?.connections?.toString() ?? "0")}
                    icon={Database}
                    className="border-l-4 border-l-blue-600"
                />
                <MetricCard
                    label="Throughput (RPM)"
                    value={isLoadingMetrics ? "..." : (metrics?.application?.requestsPerMinute?.toFixed(0) ?? "0")}
                    icon={Activity}
                    className="border-l-4 border-l-green-600"
                    trend={metrics?.application?.errorRate ? `${metrics.application.errorRate}% err` : undefined}
                    trendUp={false}
                    isLive={true}
                />
                <MetricCard
                    label="Disk Usage"
                    value={isLoadingMetrics ? "..." : (metrics?.system?.diskUsage ? `${metrics.system.diskUsage}%` : "0%")}
                    icon={HardDrive}
                    className="border-l-4 border-l-purple-600"
                />
                <MetricCard
                    label="Uptime"
                    value={isLoadingMetrics ? "..." : (metrics?.system?.uptime ? `${(metrics.system.uptime / 3600).toFixed(1)}h` : "0h")}
                    icon={Server}
                    className="border-l-4 border-l-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Traffic History (Last Hour)" className="lg:col-span-2 overflow-hidden">
                    <div className="h-64 w-full min-w-0 relative overflow-hidden">
                        <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={100} debounce={50}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    type="number"
                                    hide
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={chartTheme.tooltipStyle}
                                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                                />
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
                        {health?.checks?.map(check => (
                            <div key={check.name} className="flex justify-between items-center">
                                <span className={cn("text-sm", theme.text.secondary)}>{check.name}</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-xs font-bold",
                                    check.status === 'pass' ? `${theme.status.success.bg} ${theme.status.success.text}` :
                                        check.status === 'warn' ? `${theme.status.warning.bg} ${theme.status.warning.text}` :
                                            `${theme.status.error.bg} ${theme.status.error.text}`
                                )}>
                                    {check.status === 'pass' ? 'Healthy' : check.status === 'warn' ? 'Warning' : 'Error'}
                                </span>
                            </div>
                        ))}
                        {!health?.checks && (
                            <div className="text-sm text-gray-500 italic">No health checks available</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
});
