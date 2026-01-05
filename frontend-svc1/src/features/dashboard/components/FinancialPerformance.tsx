import { Card } from '@/components/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { FinancialPerformanceData } from '@/types';
import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const FinancialPerformance: React.FC = () => {
    const { mode } = useTheme();

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
                            <AreaChart data={finData.revenue} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                    stroke={mode === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: mode === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: mode === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                                        borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        color: mode === 'dark' ? '#f8fafc' : '#1e293b'
                                    }}
                                />
                                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1}
                                    fill="url(#colorActual)" />
                                <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5"
                                    fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Expense Distribution">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finData.expenses} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}
                                    stroke={mode === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="category"
                                    type="category"
                                    width={80}
                                    tick={{ fill: mode === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : '$0'}
                                    contentStyle={{
                                        backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                                        borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                                        borderRadius: '8px',
                                        color: mode === 'dark' ? '#f8fafc' : '#1e293b'
                                    }}
                                />
                                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
