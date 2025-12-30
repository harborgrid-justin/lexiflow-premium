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
import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, FileText, CheckCircle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Components
import { Card } from '@/components/molecules';
import { MetricCard } from '@/components/molecules';

// Services & Utils
import { DataService } from '@/services';
import { ChartColorService } from '@/services/theme/chartColorService';
// ✅ Migrated to backend API (2025-12-21)

// Types
import { PleadingDocument } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const PleadingAnalytics: React.FC = () => {
    const { theme, mode } = useTheme();

    const { data: pleadings = [] } = useQuery<PleadingDocument[]>(
        ['pleadings', 'all'],
        () => DataService.pleadings.getAll()
    );

    const analytics = useMemo(() => {
        // Motion success rate (mock calculation based on status)
        const filed = pleadings.filter(p => p.status === 'Filed').length;
        const total = pleadings.length;
        const successRate = total > 0 ? Math.round((filed / total) * 100) : 0;

        // Average drafting time (mock - 2-5 days)
        const avgDraftingTime = 3.5;

        // Clause usage (mock data) - use theme-aware colors
        const clauseUsage = [
            { name: 'Jurisdiction', count: 45, color: ChartColorService.getColorByIndex(0, mode) },
            { name: 'Summary Judgment', count: 32, color: ChartColorService.getColorByIndex(1, mode) },
            { name: 'Discovery', count: 28, color: ChartColorService.getColorByIndex(2, mode) },
            { name: 'Damages', count: 25, color: ChartColorService.getColorByIndex(3, mode) },
            { name: 'Relief Sought', count: 42, color: ChartColorService.getColorByIndex(4, mode) },
        ];

        // Monthly trend (mock data)
        const monthlyTrend = [
            { month: 'Jan', count: 12 },
            { month: 'Feb', count: 15 },
            { month: 'Mar', count: 18 },
            { month: 'Apr', count: 14 },
            { month: 'May', count: 22 },
            { month: 'Jun', count: 19 },
        ];

        // Motion type distribution
        const motionTypes = [
            { type: 'Summary Judgment', count: 18 },
            { type: 'Dismiss', count: 15 },
            { type: 'Compel', count: 12 },
            { type: 'Protective Order', count: 8 },
            { type: 'Extension', count: 7 },
        ];

        return {
            successRate,
            avgDraftingTime,
            totalPleadings: total,
            filedPleadings: filed,
            clauseUsage,
            monthlyTrend,
            motionTypes,
        };
    }, [pleadings, mode]);

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
                                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                </div>
            </Card>
        </div>
    );
};

