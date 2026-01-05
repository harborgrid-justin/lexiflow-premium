
import React from 'react';
import { Card } from '../common/Card.tsx';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface CasePredictionProps {
  outcomeData: any[];
}

export const CasePrediction: React.FC<CasePredictionProps> = ({ outcomeData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card title="Case Strength Assessment" subtitle="Multi-dimensional analysis of matter viability based on historical benchmarks.">
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={outcomeData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}}/>
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="Matter Confidence" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={3} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Outcome Forecast Engine" subtitle="AI-driven probability models calibrated via similar jurisdictional filings.">
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* VZ-21 Implementation: Probability of Settlement */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl relative overflow-hidden group border border-slate-100 shadow-inner">
                <div className="h-40 w-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={[{v: 68}, {v: 32}]} 
                                dataKey="v" 
                                innerRadius={45} 
                                outerRadius={60} 
                                startAngle={90} 
                                endAngle={-270}
                                stroke="none"
                            >
                                <Cell fill="#2563eb" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">68%</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement</span>
                    </div>
                </div>
            </div>

            {/* VZ-21 Implementation: Probability of Dismissal */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl relative overflow-hidden group border border-slate-100 shadow-inner">
                <div className="h-40 w-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={[{v: 24}, {v: 76}]} 
                                dataKey="v" 
                                innerRadius={45} 
                                outerRadius={60} 
                                startAngle={90} 
                                endAngle={-270}
                                stroke="none"
                            >
                                <Cell fill="#ef4444" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">24%</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dismissal</span>
                    </div>
                </div>
            </div>

            <div className="col-span-2 mt-2">
                <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Expected Exposure Band</span>
                        <TrendingUp className="h-4 w-4 text-blue-400"/>
                    </div>
                    <p className="text-3xl font-mono font-bold text-white tracking-tighter">$1.2M — $1.8M</p>
                    <p className="text-[11px] text-slate-400 mt-3 italic leading-relaxed border-l-2 border-blue-500/50 pl-3">
                        Confidence interval optimized via 45 peer-matter comparisons in California Superior Court. 
                        <span className="text-slate-200 block mt-1">Status: Statistically Defensible</span>
                    </p>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
