
import React from 'react';
import { MetricCard } from '../common/Primitives.tsx';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { Card } from '../common/Card.tsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const revenueData = [
    { month: 'Jan', amount: 450 }, { month: 'Feb', amount: 520 }, { month: 'Mar', amount: 480 },
    { month: 'Apr', amount: 600 }, { month: 'May', amount: 550 }, { month: 'Jun', amount: 700 }
];

export const PartnerDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Partner Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Realization Rate" value="94.2%" icon={Activity} trend="+2.4%" trendUp={true} className="border-l-4 border-l-green-500"/>
                <MetricCard label="Revenue YTD" value="$3.2M" icon={DollarSign} trend="+12% YoY" trendUp={true} className="border-l-4 border-l-blue-500"/>
                <MetricCard label="Profit Margin" value="38%" icon={TrendingUp} trend="Target: 40%" className="border-l-4 border-l-indigo-500"/>
                <MetricCard label="Active Clients" value="142" icon={Users} trend="Stable" className="border-l-4 border-l-slate-500"/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Firm Revenue Trends (k)">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}}/>
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}}/>
                                <Tooltip cursor={{fill: '#f8fafc'}}/>
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <Card title="Top Performers (Billable Hours)">
                    <div className="space-y-4">
                        {[
                            { name: 'James Doe', hours: 145, target: 140 },
                            { name: 'Sarah Jenkins', hours: 132, target: 130 },
                            { name: 'Michael Chen', hours: 120, target: 140 },
                        ].map((p, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700">{p.name}</span>
                                    <span className="text-slate-500">{p.hours} / {p.target}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${p.hours >= p.target ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${Math.min((p.hours/p.target)*100, 100)}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
