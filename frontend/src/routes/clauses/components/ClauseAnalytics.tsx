import { ChartColorService } from "@/unknown_fix_me/ChartColorService";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { Clause } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import { CheckCircle, FileText, ShieldAlert, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getRiskData, getUsageData } from './clauseAnalytics.utils';

export function ClauseAnalytics() {
    const { mode } = useTheme();
    const chartTheme = ChartColorService.getChartTheme(mode);
    const tooltipStyle = ChartColorService.getTooltipStyle(mode);
    const chartColors = ChartColorService.getChartColors(mode);

    // Load clauses from IndexedDB via useQuery for accurate, cached data
    const { data: clausesData = [] } = useQuery<Clause[]>(
        queryKeys.clauses.all(),
        () => DataService.clauses.getAll()
    );

    const clauses = Array.isArray(clausesData) ? clausesData : [];
    const riskData = getRiskData(clauses, mode as 'light' | 'dark');
    const usageData = getUsageData(clauses);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Clauses"
                    value={clauses.length}
                    icon={FileText}
                    className="border-l-4 border-l-blue-600"
                />
                <MetricCard
                    label="High Risk Items"
                    value={riskData.find(d => d.name === 'High Risk')?.value || 0}
                    icon={ShieldAlert}
                    className="border-l-4 border-l-red-500"
                />
                <MetricCard
                    label="Most Used"
                    value={usageData[0]?.usage || 0}
                    icon={TrendingUp}
                    trend="Indemnification"
                    className="border-l-4 border-l-green-500"
                />
                <MetricCard
                    label="Avg Revisions"
                    value="2.4"
                    icon={CheckCircle}
                    className="border-l-4 border-l-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Risk Distribution">
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`risk-${entry.name}-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Used Clauses">
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: chartTheme.text }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} />
                                <Bar dataKey="usage" fill={chartColors.primary} radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
