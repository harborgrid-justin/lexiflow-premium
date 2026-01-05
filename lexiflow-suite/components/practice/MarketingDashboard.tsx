
import React from 'react';
import { Card } from '../common/Card.tsx';
import { MetricCard } from '../common/Primitives.tsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Megaphone, Target, ArrowRight } from 'lucide-react';
import { MOCK_METRICS } from '../../data/models/marketingMetric.ts';

export const MarketingDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Special Gradient Card for Pipeline Value */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Pipeline Value</p>
              <p className="text-3xl font-bold mt-2 tracking-tight">$1.4M</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><Target className="h-6 w-6 text-white"/></div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 relative z-10 flex items-center text-xs text-indigo-100">
             <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-bold mr-2 border border-white/10">Potential</span>
             from "Conflict Check" stage
          </div>
        </div>
        
        <MetricCard 
            label="Conversion Rate" 
            value="18.5%" 
            icon={Users} 
            trend="↑ 2.1% vs last month" 
            trendUp={true}
            className="border-l-4 border-l-blue-500"
        />

        <MetricCard 
            label="Cost Per Acquisition" 
            value="$450" 
            icon={Megaphone} 
            trend="Based on ad spend"
            className="border-l-4 border-l-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Lead Source">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_METRICS} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="source" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false}/>
                <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                  {MOCK_METRICS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Active Marketing Campaigns">
          <div className="space-y-3">
            <div className="p-3 border border-slate-200 rounded-lg bg-white flex justify-between items-center hover:border-blue-300 transition-colors shadow-sm cursor-pointer group">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 group-hover:text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Q1 Webinar Series
                </h4>
                <p className="text-xs text-slate-500 mt-1 pl-4">Target: Corporate Counsel</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-medium border border-slate-200">WEB-01</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-white flex justify-between items-center hover:border-blue-300 transition-colors shadow-sm cursor-pointer group">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 group-hover:text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Google Ads - "Commercial Lit"
                </h4>
                <p className="text-xs text-slate-500 mt-1 pl-4">Budget: $2,000/mo</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-medium border border-slate-200">PPC-04</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center opacity-75">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> LegalTech Conference
                </h4>
                <p className="text-xs text-slate-500 mt-1 pl-4">Dates: Sep 15-18</p>
              </div>
              <span className="text-[10px] bg-white text-slate-500 px-2 py-1 rounded font-mono font-medium border border-slate-200">EVENT</span>
            </div>
            
            <button className="w-full py-2 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-transparent hover:border-blue-100">
              View All Campaigns <ArrowRight className="h-3 w-3"/>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
