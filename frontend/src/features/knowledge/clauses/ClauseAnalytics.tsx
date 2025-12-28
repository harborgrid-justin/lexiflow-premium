
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card } from '@/components/molecules/Card';
import { MetricCard } from '@/components/molecules/MetricCard';
import { ShieldAlert, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { getRiskData, getUsageData } from './clauseAnalytics.utils';
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Clause } from '@/types';

export const ClauseAnalytics: React.FC = () => {
  const { theme, mode } = useTheme();
  
  // Load clauses from IndexedDB via useQuery for accurate, cached data
  const { data: clausesData = [], isLoading } = useQuery<Clause[]>(
    queryKeys.clauses.all(),
    () => DataService.clauses.getAll()
  );

  const clauses = Array.isArray(clausesData) ? clausesData : [];
  const riskData = getRiskData(clauses, mode);
  const usageData = getUsageData(clauses);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
                label="Total Clauses" 
                value={clauses.length} 
                icon={FileText} 
                className="border-l-4 border-l-blue-600"
            />
            <MetricCard 
                label="High Risk Items" 
                value={riskData.find(d => d.name === 'High Risk')?.value || 0} 
                icon={ShieldAlert} 
                className="border-l-4 border-l-red-500"
            />
            <MetricCard 
                label="Most Used" 
                value={usageData[0]?.usage || 0} 
                icon={TrendingUp} 
                trend="Indemnification"
                className="border-l-4 border-l-green-500"
            />
            <MetricCard 
                label="Avg Revisions" 
                value="2.4" 
                icon={CheckCircle} 
                className="border-l-4 border-l-purple-500"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Risk Distribution">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={riskData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Top Used Clauses">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="usage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    </div>
  );
};

