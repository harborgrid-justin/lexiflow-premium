
import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Briefcase, ChevronRight, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface DashboardAnalyticsProps {
  activeProjects: any[];
  chartData: any[];
}

export const DashboardAnalytics = memo<DashboardAnalyticsProps>(({ activeProjects, chartData }) => {
  const { theme, mode } = useTheme();
  // We use hex codes for charts as Recharts doesn't support Tailwind classes directly in all props
  const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

  const chartColors = {
    grid: mode === 'dark' ? '#334155' : '#e2e8f0',
    text: mode === 'dark' ? '#94a3b8' : '#64748b',
    tooltipBg: mode === 'dark' ? '#1e293b' : '#ffffff',
    tooltipBorder: mode === 'dark' ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="xl:col-span-2 space-y-6">
        <Card title="Case Phase Distribution & Volume" subtitle="Active matters by litigation stage">
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: mode === 'dark' ? '#334155' : '#f8fafc'}}
                      contentStyle={{ 
                          backgroundColor: chartColors.tooltipBg, 
                          borderColor: chartColors.tooltipBorder, 
                          borderRadius: '8px',
                          color: mode === 'dark' ? '#f8fafc' : '#1e293b'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card title="Priority Workstreams" subtitle="High-impact tasks requiring attention" noPadding>
            <div className={cn("divide-y", theme.border.light)}>
                {activeProjects.map(proj => (
                    <div key={proj.id} className={cn("flex flex-col sm:flex-row sm:items-center py-4 px-5 transition-colors group cursor-pointer", `hover:${theme.surfaceHighlight}`)}>
                        <div className="flex items-center flex-1 min-w-0 mb-3 sm:mb-0">
                            <div className={cn("p-2.5 rounded-lg mr-4 shrink-0 transition-colors", theme.primary.light, theme.primary.text)}>
                                <Briefcase className="h-5 w-5"/>
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
                                <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surfaceHighlight)}>
                                    <div className={cn("h-1.5 rounded-full transition-all duration-1000", theme.primary.DEFAULT)} style={{ width: `${proj.progress}%` }}></div>
                                </div>
                            </div>
                            <div className={cn("hidden sm:block transition-colors", theme.text.tertiary, `group-hover:${theme.primary.text}`)}>
                                <ChevronRight className="h-4 w-4"/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className={cn("p-3 border-t flex justify-center rounded-b-lg", theme.border.default, theme.surfaceHighlight)}>
                <Button variant="ghost" size="sm" className={theme.primary.text}>View All Active Projects <ArrowRight className="ml-1 h-3 w-3"/></Button>
            </div>
        </Card>
    </div>
  );
});
