import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';
import { Activity, AlertTriangle, CheckCircle, FileText, Loader2, ShieldAlert } from 'lucide-react';
import { memo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useComplianceOverview } from './hooks/useComplianceOverview';

export const ComplianceOverview = memo(() => {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();

    const [{ metrics, chartData, status }, { refresh }] = useComplianceOverview();

    if (status === 'loading') {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <p className="text-red-500">Failed to load compliance data</p>
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Compliance Score"
                    value={`${metrics?.score || 0}/100`}
                    icon={ShieldAlert}
                    trend="+2% vs Last Qtr"
                    trendUp={true}
                    className="border-l-4 border-l-emerald-500"
                />
                <MetricCard
                    label="Pending Conflicts"
                    value={metrics?.high || 0}
                    icon={AlertTriangle}
                    trend="Needs Review"
                    trendUp={false}
                    className="border-l-4 border-l-amber-500"
                />
                <MetricCard
                    label="Active Walls"
                    value={metrics?.activeWalls || 0}
                    icon={FileText}
                    className="border-l-4 border-l-blue-500"
                />
                <MetricCard
                    label="Policy Violations"
                    value={metrics?.violations || 0}
                    icon={CheckCircle}
                    className="border-l-4 border-l-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <Card title="Client Risk Profile" className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="h-64 w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`compliance-risk-${entry.name}-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={chartTheme.tooltipStyle} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4 p-4">
                            <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                                <h4 className={cn("font-bold text-sm mb-2", theme.text.primary)}>High Risk Factors</h4>
                                <ul className={cn("space-y-2 text-xs", theme.text.secondary)}>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Politically Exposed Persons (PEP)</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Sanctions List Matches</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Missing Engagement Letters</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Recent Alerts */}
                <Card title="Recent Alerts">
                    <div className="space-y-4">
                        {[
                            { title: 'Conflict Hit: MegaCorp', time: '2 hours ago', severity: 'medium' },
                            { title: 'Ethical Wall Update', time: '5 hours ago', severity: 'low' },
                            { title: 'GDPR Data Request', time: 'Yesterday', severity: 'high' },
                        ].map((alert, i) => (
                            <div key={`alert-${alert.title.replace(/\s+/g, '-')}-${i}`} className={cn("flex items-start p-3 rounded-lg border transition-colors", theme.surface.highlight, theme.border.default)}>
                                <Activity className={cn("h-4 w-4 mt-0.5 mr-3", alert.severity === 'high' ? "text-red-500" : alert.severity === 'medium' ? "text-amber-500" : "text-blue-500")} />
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>{alert.title}</p>
                                    <p className={cn("text-xs", theme.text.tertiary)}>{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
});

ComplianceOverview.displayName = 'ComplianceOverview';
