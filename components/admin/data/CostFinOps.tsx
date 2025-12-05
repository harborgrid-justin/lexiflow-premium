
import React from 'react';
import { DollarSign, TrendingDown, Server, AlertTriangle } from 'lucide-react';
import { Card } from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

const costData = [
    { name: 'Compute', cost: 1200 },
    { name: 'Storage', cost: 850 },
    { name: 'Network', cost: 300 },
    { name: 'DB', cost: 1500 },
    { name: 'AI', cost: 2200 },
];

const forecastData = [
    { day: '1', actual: 120, forecast: 125 },
    { day: '5', actual: 135, forecast: 130 },
    { day: '10', actual: 140, forecast: 145 },
    { day: '15', actual: 180, forecast: 160 },
    { day: '20', actual: null, forecast: 185 },
    { day: '25', actual: null, forecast: 190 },
    { day: '30', actual: null, forecast: 210 },
];

export const CostFinOps: React.FC = () => {
  const { theme, mode } = useTheme();
  
  const chartColors = {
    text: mode === 'dark' ? '#94a3b8' : '#64748b',
    grid: mode === 'dark' ? '#334155' : '#e2e8f0',
    tooltipBg: mode === 'dark' ? '#1e293b' : '#ffffff',
    tooltipBorder: mode === 'dark' ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card>
                 <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Total Monthly Spend</p>
                 <p className={cn("text-3xl font-bold flex items-center", theme.text.primary)}><DollarSign className="h-6 w-6"/> 6,050</p>
             </Card>
             <Card>
                 <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Forecast (EOM)</p>
                 <p className="text-3xl font-bold text-blue-600">$6,200</p>
             </Card>
             <Card>
                 <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Savings Opportunity</p>
                 <p className="text-3xl font-bold text-green-600 flex items-center"><TrendingDown className="h-6 w-6 mr-2"/> $450</p>
             </Card>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cost by Service">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke={chartColors.text} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} fontSize={12} stroke={chartColors.text} />
                            <Tooltip 
                                formatter={(v) => `$${v}`} 
                                cursor={{fill: mode === 'dark' ? '#334155' : '#f1f5f9'}} 
                                contentStyle={{backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: mode === 'dark' ? '#f8fafc' : '#1e293b'}}
                            />
                            <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
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
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid}/>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke={chartColors.text} />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke={chartColors.text} />
                            <Tooltip contentStyle={{backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: mode === 'dark' ? '#f8fafc' : '#1e293b'}} />
                            <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
                            <Area type="monotone" dataKey="forecast" stroke="#94a3b8" strokeDasharray="5 5" fill="none" />
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
                 <div className={cn("p-4 border rounded-lg flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
                     <div>
                         <h4 className={cn("font-bold text-sm", theme.text.primary)}>Daily Compute Cap</h4>
                         <p className={cn("text-xs", theme.text.secondary)}>Used: $45 / $100</p>
                     </div>
                     <div className={cn("w-32 rounded-full h-2", theme.border.default, "bg-slate-200 dark:bg-slate-700")}>
                         <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                     </div>
                 </div>
             </div>
        </Card>
    </div>
  );
};
