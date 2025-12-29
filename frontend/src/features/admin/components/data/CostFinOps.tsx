
import React from 'react';

import { DollarSign, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

import { useTheme } from '@/providers/ThemeContext';
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { CostMetric, CostForecast } from '@/types';
import { cn } from '@/utils/cn';
import { Card } from '@/components/molecules';
import { useChartTheme } from '@/components/organisms';
import { MetricCard } from '@/components/molecules';

export function CostFinOps() {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  const { data: costData = [], isLoading: costLoading } = useQuery<CostMetric[]>(
      ['finops', 'costs'],
      () => (DataService as unknown as { operations: { getCostMetrics: () => Promise<CostMetric[]> } }).operations.getCostMetrics()
  );

  const { data: forecastData = [], isLoading: forecastLoading } = useQuery<CostForecast[]>(
      ['finops', 'forecast'],
      () => (DataService as unknown as { operations: { getCostForecast: () => Promise<CostForecast[]> } }).operations.getCostForecast()
  );

  const isLoading = costLoading || forecastLoading;

  if (isLoading) {return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)}/></div>;}

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <MetricCard 
                label="Total Monthly Spend" 
                value={<span className="flex items-center"><DollarSign className="h-6 w-6"/> 6,050</span>} 
             />
             <MetricCard 
                label="Forecast (EOM)" 
                value={<span className="text-blue-600">$6,200</span>} 
             />
             <MetricCard 
                label="Savings Opportunity" 
                value={<span className="text-green-600 flex items-center"><TrendingDown className="h-6 w-6 mr-2"/> $45,100</span>} 
             />
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cost by Service">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke={chartTheme.text} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} fontSize={12} stroke={chartTheme.text} />
                            <Tooltip 
                                formatter={(v) => `$${String(v)}`} 
                                cursor={{fill: chartTheme.grid}} 
                                contentStyle={chartTheme.tooltipStyle}
                            />
                            <Bar dataKey="cost" fill={chartTheme.colors.secondary} radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Spend Forecast">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid}/>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke={chartTheme.text} />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke={chartTheme.text} />
                            <Tooltip contentStyle={chartTheme.tooltipStyle} />
                            <Area type="monotone" dataKey="actual" stroke={chartTheme.colors.primary} fillOpacity={1} fill="url(#colorActual)" />
                            <Area type="monotone" dataKey="forecast" stroke={chartTheme.colors.neutral} strokeDasharray="5 5" fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>

        <Card title="Budget Alerts">
             <div className="space-y-4">
                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                     <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"/>
                     <div>
                         <h4 className="font-bold text-sm text-amber-800">Vector Storage Threshold</h4>
                         <p className="text-xs text-amber-700 mt-1">Pinecone index usage at 85% of monthly budget. Projected to exceed in 3 days.</p>
                     </div>
                 </div>
                 <div className={cn("p-4 border rounded-lg flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                     <div>
                         <h4 className={cn("font-bold text-sm", theme.text.primary)}>Daily Compute Cap</h4>
                         <p className={cn("text-xs", theme.text.secondary)}>Used: $45 / $100</p>
                     </div>
                     <div className={cn("w-32 rounded-full h-2", theme.border.default, "bg-slate-200 dark:bg-slate-700")}>
                         <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}} />
                     </div>
                 </div>
             </div>
        </Card>
    </div>
  );
};

export default CostFinOps;
