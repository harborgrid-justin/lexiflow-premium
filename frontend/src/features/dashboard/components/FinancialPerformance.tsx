import { useTheme, ChartColorService } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { FinancialPerformanceData } from '@/types';
import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const FinancialPerformance: React.FC = () => {
    const { mode, theme } = useTheme();
    const chartColors = ChartColorService.getChartColors(mode);
    const chartTheme = ChartColorService.getChartTheme(mode);
    const tooltipStyle = ChartColorService.getTooltipStyle(mode);

    // Integrated Data Query
    const { data: finData = { revenue: [], expenses: [] } } = useQuery<FinancialPerformanceData>(
        ['billing', 'performance'],
        DataService.billing.getFinancialPerformance
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Revenue vs Target (YTD)">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <AreaChart data={finData.revenue as any[]} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                    stroke={chartTheme.grid} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: chartTheme.text, fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: chartTheme.text, fontSize: 12 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                />
                                <Area type="monotone" dataKey="actual" stroke={chartColors.primary} fillOpacity={1}
                                    fill="url(#colorActual)" />
                                <Area type="monotone" dataKey="target" stroke={chartColors.neutral} strokeDasharray="5 5"
                                    fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Expense Distribution">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <BarChart data={finData.expenses as any[]} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}
                                    stroke={chartTheme.grid} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="category"
                                    type="category"
                                    width={80}
                                    tick={{ fill: chartTheme.text, fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : '$0'}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="value" fill={chartColors.danger} radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
