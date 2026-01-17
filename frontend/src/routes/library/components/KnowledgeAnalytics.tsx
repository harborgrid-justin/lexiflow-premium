/**
 * @module components/knowledge/KnowledgeAnalytics
 * @category Knowledge
 * @description Knowledge usage analytics with charts.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme and useChartTheme hooks for visualizations.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BookOpen, Search, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { knowledgeApi } from '@/lib/frontend-api';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';
import { useTheme } from "@/hooks/useTheme";

// Components
import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES
// ============================================================================

interface KnowledgeAnalyticsData {
    usage: Array<{ name: string; views: number }>;
    topics: Array<{ name: string; value: number; color: string }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function KnowledgeAnalytics() {
    const { theme } = useTheme();
    const chartTheme = useChartTheme();

    // Enterprise Data Access
    const { data: analytics = { usage: [], topics: [] } } = useQuery<KnowledgeAnalyticsData>(
        ['qa', 'analytics'],
        async () => {
            const result = await knowledgeApi.getAllKnowledge({ page: 1, limit: 200 });
            if (!result.ok) return { usage: [], topics: [] };

            const items = result.data.data;
            const usage = items.slice(0, 7).map((item, index) => ({
                name: item.title.slice(0, 12) || `Item ${index + 1}`,
                views: Math.max(1, (item.content || '').length),
            }));

            const topicCounts = items.reduce<Record<string, number>>((acc, item) => {
                const key = (item.title.split(' ')[0] || 'General').toLowerCase();
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            const topics = Object.entries(topicCounts).slice(0, 5).map(([name, value], idx) => ({
                name,
                value,
                color: idx % 2 === 0 ? chartTheme.colors.primary : chartTheme.colors.secondary,
            }));

            return { usage, topics };
        }
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Article Views (Wk)"
                    value="663"
                    icon={BookOpen}
                    trend="+12%"
                    trendUp={true}
                    className="border-l-4 border-l-blue-600"
                />
                <MetricCard
                    label="Active Contributors"
                    value="24"
                    icon={Users}
                    className="border-l-4 border-l-purple-600"
                />
                <MetricCard
                    label="Search Queries"
                    value="1,204"
                    icon={Search}
                    trend="+5%"
                    trendUp={true}
                    className="border-l-4 border-l-emerald-600"
                />
                <MetricCard
                    label="Engagement Rate"
                    value="42%"
                    icon={TrendingUp}
                    className="border-l-4 border-l-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Knowledge Consumption">
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.usage} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: chartTheme.text }} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: chartTheme.text }} />
                                <Tooltip cursor={{ fill: chartTheme.grid }} contentStyle={chartTheme.tooltipStyle} />
                                <Bar dataKey="views" fill={chartTheme.colors.primary} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Popular Topics">
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.topics}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.topics.map((entry, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Top Articles" className="lg:col-span-2">
                    <div className={cn("space-y-3", theme.text.secondary)}>
                        {[
                            { title: 'California Employment Litigation Playbook', views: 245, author: 'Sarah Miller' },
                            { title: 'Standard Billing Codes & Rates 2024', views: 180, author: 'Finance Team' },
                            { title: 'Remote Deposition Protocols', views: 120, author: 'James Doe' },
                        ].map((article) => (
                            <div key={`article-${article.title}`} className={cn("flex justify-between items-center p-3 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                                <div>
                                    <p className={cn("font-medium text-sm", theme.text.primary)}>{article.title}</p>
                                    <p className="text-xs">Author: {article.author}</p>
                                </div>
                                <div className="text-right">
                                    <p className={cn("font-bold", theme.primary.text)}>{article.views}</p>
                                    <p className="text-[10px] uppercase">Views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Pending Review">
                    <div className="space-y-4">
                        <div className={cn("p-4 border border-l-4 border-l-amber-500 rounded-lg bg-amber-50", theme.border.default)}>
                            <h4 className="text-sm font-bold text-amber-800 mb-1">Outdated Content</h4>
                            <p className="text-xs text-amber-700">3 articles flagged for review due to regulatory updates in 2024.</p>
                        </div>
                        <div className={cn("p-4 border border-l-4 border-l-blue-500 rounded-lg bg-blue-50", theme.border.default)}>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">New Drafts</h4>
                            <p className="text-xs text-blue-800">5 new practice guides submitted by associates awaiting partner approval.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
