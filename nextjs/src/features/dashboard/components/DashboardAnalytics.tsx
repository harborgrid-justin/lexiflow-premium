/**
 * @module components/dashboard/DashboardAnalytics
 * @category Dashboard
 * @description Analytics visualization with case phase distribution chart and
 * active project summaries.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors and chart themes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ArrowRight, Briefcase, ChevronRight } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useChartTheme } from '@/components/features/core/components/ChartHelpers/ChartHelpers';
import { useTheme } from '@/providers';

// Components
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface ProjectSummary {
    id: string;
    title: string;
    status: string;
    case: string;
    due: string;
    progress: number;
}

export interface ChartDataPoint {
    name: string;
    count: number;
}

interface DashboardAnalyticsProps {
    /** Array of active project summaries. */
    activeProjects: ProjectSummary[];
    /** Chart data for case phase distribution. */
    chartData: ChartDataPoint[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardAnalytics = memo<DashboardAnalyticsProps>(({ activeProjects, chartData }) => {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();
    const [isMounted, setIsMounted] = useState(false);

    // Delay chart rendering to ensure container has dimensions
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const CHART_COLORS = [
        chartTheme.colors.primary,
        chartTheme.colors.secondary,
        chartTheme.colors.secondary,
        chartTheme.colors.success,
        chartTheme.colors.warning
    ];

    // Ensure chartData and activeProjects are arrays
    const safeChartData = Array.isArray(chartData) ? chartData : [];
    const safeActiveProjects = Array.isArray(activeProjects) ? activeProjects : [];

    return (
        <div className="xl:col-span-2 space-y-6">
            <Card title="Case Phase Distribution & Volume" subtitle="Active matters by litigation stage" className="h-[28rem]">
                <div className="h-full w-full min-h-[20rem] relative overflow-hidden">
                    {isMounted && safeChartData.length > 0 ? (
                        <ResponsiveContainer width="99%" height="100%" debounce={50}>
                            <BarChart data={safeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: theme.surface.highlight }}
                                    contentStyle={chartTheme.tooltipStyle}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {safeChartData.map((entry, index) => (
                                        <Cell key={`analytics-cell-${entry.name || index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            {isMounted ? 'No data available' : 'Loading chart...'}
                        </div>
                    )}
                </div>
            </Card>

            <Card title="Priority Workstreams" subtitle="High-impact tasks requiring attention" noPadding>
                <div className={cn("divide-y", theme.border.default)}>
                    {safeActiveProjects.map(proj => (
                        <div key={proj.id} className={cn("flex flex-col sm:flex-row sm:items-center py-4 px-5 transition-colors group cursor-pointer", `hover:${theme.surface.highlight}`)}>
                            <div className="flex items-center flex-1 min-w-0 mb-3 sm:mb-0">
                                <div className={cn("p-2.5 rounded-lg mr-4 shrink-0 transition-colors", theme.primary.light, theme.primary.text)}>
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={cn("font-semibold text-sm truncate", theme.text.primary)}>{proj.title}</h4>
                                        <Badge variant={proj.status === 'Finalizing' ? 'success' : 'info'}>{proj.status}</Badge>
                                    </div>
                                    <p className={cn("text-xs truncate flex items-center", theme.text.secondary)}>
                                        {proj.case}
                                        <span className="mx-2">•</span>
                                        <span className={proj.due === 'Today' ? "text-amber-600 font-bold" : ""}>Due: {proj.due}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 sm:ml-4 w-full sm:w-auto">
                                <div className="flex-1 sm:w-32">
                                    <div className={cn("flex justify-between text-[10px] mb-1", theme.text.secondary)}>
                                        <span>Progress</span>
                                        <span>{proj.progress}%</span>
                                    </div>
                                    <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surface.highlight)}>
                                        { }
                                        <div className={cn("h-1.5 rounded-full transition-all duration-1000", theme.primary.DEFAULT)} style={{ width: `${proj.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className={cn("hidden sm:block transition-colors", theme.text.tertiary, `group-hover:${theme.primary.text}`)}>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={cn("p-3 border-t flex justify-center rounded-b-lg", theme.border.default, theme.surface.highlight)}>
                    <Button variant="ghost" size="sm" className={theme.primary.text}>View All Active Projects <ArrowRight className="ml-1 h-3 w-3" /></Button>
                </div>
            </Card>
        </div >
    );
});
DashboardAnalytics.displayName = 'DashboardAnalytics';
