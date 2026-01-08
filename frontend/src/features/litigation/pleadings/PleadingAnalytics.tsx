/**
 * @module components/pleading/PleadingAnalytics
 * @category Pleadings
 * @description Analytics for motion success rates, drafting time, and clause usage.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Components
import { Card } from '@/components/ui/molecules/Card/Card';
import { MetricCard } from '@/components/ui/molecules/MetricCard/MetricCard';

// Services & Utils
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)

// Types
import { Pleading } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const PleadingAnalytics: React.FC = () => {
    const { theme } = useTheme();

    const { data: pleadings = [] } = useQuery<Pleading[]>(
        ['pleadings', 'all'],
        () => DataService.pleadings.getAll()
    );

    // Fetch clause usage data
    const { data: clauseDataFromApi = [] } = useQuery<Array<{ name?: string; title?: string; count?: number }>>(
        ['analytics', 'clause_usage'],
        async () => {
            try {
                return await (DataService as { analytics?: { getClauseUsage?: () => Promise<unknown[]> } }).analytics?.getClauseUsage?.() || [];
            } catch (error) {
                console.warn('[PleadingAnalytics] Clause usage data unavailable:', error);
                return [];
            }
        }
    );

    const analytics = useMemo(() => {
        // Motion success rate
        // 'filed' status indicates success in this context
        const filed = pleadings.filter(p => p.status === 'filed').length;
        const total = pleadings.length;
        const successRate = total > 0 ? Math.round((filed / total) * 100) : 0;

        // Average drafting time
        // Calculate days between creation and filing
        const completedPleadings = pleadings.filter(p => p.createdAt && p.filedDate);
        let avgDraftingTime = 0;
        if (completedPleadings.length > 0) {
            const totalDays = completedPleadings.reduce((acc, p) => {
                const start = new Date(p.createdAt!).getTime();
                const end = new Date(p.filedDate!).getTime();
                // Ensure positive duration
                const duration = Math.max(0, end - start);
                return acc + duration / (1000 * 60 * 60 * 24);
            }, 0);
            avgDraftingTime = parseFloat((totalDays / completedPleadings.length).toFixed(1));
        }

        // Clause usage - from backend API
        const clauseUsage = clauseDataFromApi.map((clause: { name?: string; title?: string; count?: number }, idx: number) => ({
            name: clause.name || clause.title,
            count: clause.count || 0,
            color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][idx % 5]
        }));

        // Monthly trend
        // Group by creation month
        const monthlyCounts: Record<string, number> = {};
        // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize with 0 for last 6 months to show trend even if empty
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyCounts[monthName] = 0;
        }

        pleadings.forEach(p => {
            if (p.createdAt) {
                const date = new Date(p.createdAt);
                const month = date.toLocaleString('default', { month: 'short' });
                if (monthlyCounts[month] !== undefined) {
                    monthlyCounts[month]++;
                }
            }
        });

        // Better approach for monthly trend to ensure order:
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            trendData.push({
                month: monthName,
                count: monthlyCounts[monthName] || 0
            });
        }


        // Motion type distribution
        const typeCounts: Record<string, number> = {};
        pleadings.forEach(p => {
            const type = p.type ? (p.type.charAt(0).toUpperCase() + p.type.slice(1)) : 'Unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const motionTypes = Object.entries(typeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 types

        return {
            successRate,
            avgDraftingTime,
            totalPleadings: total,
            filedPleadings: filed,
            clauseUsage,
            monthlyTrend: trendData,
            motionTypes,
        };
    }, [pleadings, clauseDataFromApi]);

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Pleadings"
                    value={analytics.totalPleadings}
                    icon={FileText}
                    className="border-l-4 border-l-blue-600"
                />
                <MetricCard
                    label="Filed"
                    value={analytics.filedPleadings}
                    icon={CheckCircle}
                    className="border-l-4 border-l-emerald-500"
                />
                <MetricCard
                    label="Success Rate"
                    value={`${analytics.successRate}%`}
                    icon={TrendingUp}
                    className="border-l-4 border-l-purple-600"
                />
                <MetricCard
                    label="Avg. Draft Time"
                    value={`${analytics.avgDraftingTime}d`}
                    icon={Clock}
                    className="border-l-4 border-l-amber-500"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Monthly Pleading Volume">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Motion Type Distribution">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.motionTypes}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" fontSize={10} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Clause Usage */}
            <Card title="Most Used Clauses">
                <div className="h-72">
                    {analytics.clauseUsage.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.clauseUsage}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {analytics.clauseUsage.map((entry, index) => (
                                            <Cell key={`clause-${entry.name}-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-4 flex-wrap">
                                {analytics.clauseUsage.map(clause => (
                                    <div key={clause.name} className="flex items-center text-xs">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: clause.color }} />
                                        <span className={theme.text.secondary}>{clause.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm">No clause usage data available</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
