
import React from 'react';
import { Card } from '../common/Card.tsx';
import { TrendingDown, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { month: 'Jan', actual: 4000, budget: 2400 },
  { month: 'Feb', actual: 3000, budget: 1398 },
  { month: 'Mar', actual: 2000, budget: 9800 },
  { month: 'Apr', actual: 2780, budget: 3908 },
  { month: 'May', actual: 1890, budget: 4800 },
  { month: 'Jun', actual: 2390, budget: 3800 },
];

export const BudgetForecaster: React.FC = () => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Budget</p>
                <p className="text-3xl font-mono font-bold text-slate-900 mt-2">$250,000</p>
                <div className="mt-2 text-xs text-slate-400">Fiscal Year 2024</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spend YTD</p>
                <p className="text-3xl font-mono font-bold text-blue-600 mt-2">$84,200</p>
                <div className="mt-2 text-xs text-blue-600 font-medium flex items-center"><TrendingUp size={12} className="mr-1"/> 33.6% Utilized</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Overage</p>
                <p className="text-3xl font-mono font-bold text-green-600 mt-2">-$12,000</p>
                <div className="mt-2 text-xs text-green-600 font-medium flex items-center"><TrendingDown size={12} className="mr-1"/> Under Budget</div>
            </div>
        </div>

        <Card title="Burn Rate Analysis">
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <Tooltip />
                        <Area type="monotone" dataKey="budget" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBudget)" />
                        <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    </div>
  );
};
