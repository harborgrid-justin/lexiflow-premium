
import React from 'react';
import { Card } from '../../../common/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../../../context/ThemeContext';
import { useChartTheme } from '../../../common/ChartHelpers';
import { useQuery } from '../../../../hooks/useQueryHooks';
import { DataService } from '../../../../services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { Loader2 } from 'lucide-react';

// Map theme colors to chart
const CHART_COLORS = ['#94a3b8', '#64748b', '#3b82f6', '#22c55e'];

interface FunnelDataItem {
  name: string;
  value: number;
  label: string;
}

interface CustodianDataItem {
  name: string;
  docs: number;
}

const DiscoveryCharts: React.FC = () => {
  const { mode: _mode } = useTheme();
  const chartTheme = useChartTheme();
  
  const { data: funnelData = [], isLoading: funnelLoading } = useQuery<FunnelDataItem[]>(
      ['discovery-funnel-stats', 'main'],
      DataService.discovery.getFunnelStats as never
  );
  
  const { data: custodianData = [], isLoading: custodianLoading } = useQuery<CustodianDataItem[]>(
      ['discovery-custodian-stats', 'main'],
      DataService.discovery.getCustodianStats as never
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
            <ResponsiveContainer width="100%" height={256}>
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
                    formatter={(value: number | string | undefined) => typeof value === 'number' ? value.toLocaleString() : (value ?? '')} 
                    contentStyle={chartTheme.tooltipStyle}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: chartTheme.text, formatter: (v: unknown) => typeof v === 'number' ? (funnelData.find((d: FunnelDataItem) => d.value === v)?.label ?? '') : '' }}>
                    {funnelData.map((entry: FunnelDataItem, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>

        <Card title="Custodian Volume">
            <ResponsiveContainer width="100%" height={256}>
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
        </Card>
    </div>
  );
};

export default DiscoveryCharts;

