
import React from 'react';
import { Card } from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const funnelData = [
    { name: 'Collection', value: 120000, label: '120k Docs' },
    { name: 'Processing', value: 85000, label: '85k De-NIST' },
    { name: 'Review', value: 24000, label: '24k Responsive' },
    { name: 'Production', value: 1500, label: '1.5k Produced' },
];

const custodianData = [
    { name: 'J. Doe', docs: 4500 },
    { name: 'J. Smith', docs: 3200 },
    { name: 'HR Dept', docs: 8900 },
    { name: 'IT Admin', docs: 1200 },
];

// Map theme colors to chart
const CHART_COLORS = ['#94a3b8', '#64748b', '#3b82f6', '#22c55e'];

export const DiscoveryCharts: React.FC = () => {
  const { mode } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="EDRM Data Funnel" className="lg:col-span-2">
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="horizontal" barCategoryGap="20%">
                        <XAxis 
                        dataKey="name" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{fill: mode === 'dark' ? '#94a3b8' : '#64748b'}} 
                        />
                        <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        formatter={(value: number) => value.toLocaleString()} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: mode === 'dark' ? '#cbd5e1' : '#475569', formatter: (v:any) => funnelData.find(d => d.value === v)?.label }}>
                        {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                        ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card title="Custodian Volume">
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={custodianData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                        dataKey="name" 
                        type="category" 
                        fontSize={11} 
                        width={60} 
                        tick={{fill: mode === 'dark' ? '#94a3b8' : '#64748b'}} 
                        />
                        <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="docs" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    </div>
  );
};
