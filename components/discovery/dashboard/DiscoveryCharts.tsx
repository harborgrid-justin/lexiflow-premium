
import React from 'react';
import { Card } from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useChartTheme } from '../../common/ChartHelpers';
import { useQuery } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { STORES } from '../../../services/db';
import { Loader2 } from 'lucide-react';

// Map theme colors to chart
const CHART_COLORS = ['#94a3b8', '#64748b', '#3b82f6', '#22c55e'];

const DiscoveryCharts: React.FC = () => {
  const { mode } = useTheme();
  const chartTheme = useChartTheme();
  
  const { data: funnelData = [], isLoading: funnelLoading } = useQuery(
      [STORES.DISCOVERY_FUNNEL_STATS, 'main'],
      DataService.discovery.getFunnelStats as any
  );
  
  const { data: custodianData = [], isLoading: custodianLoading } = useQuery(
      [STORES.DISCOVERY_CUSTODIAN_STATS, 'main'],
      DataService.discovery.getCustodianStats as any
  );

  if (funnelLoading || custodianLoading) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-blue-600"/>
          </div>
      );
  }

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
                        tick={{fill: chartTheme.text}} 
                        />
                        <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        formatter={(value: any) => value.toLocaleString()} 
                        contentStyle={chartTheme.tooltipStyle}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: chartTheme.text, formatter: (v:any) => (funnelData.find((d: any) => d.value === v) as any)?.label }}>
                        {funnelData.map((entry: any, index: number) => (
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
                        tick={{fill: chartTheme.text}} 
                        />
                        <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={chartTheme.tooltipStyle}
                        />
                        <Bar dataKey="docs" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    </div>
  );
};

export default DiscoveryCharts;
