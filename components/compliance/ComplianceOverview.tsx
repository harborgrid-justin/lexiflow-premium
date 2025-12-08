
import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { MetricCard } from '../common/Primitives';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DataService } from '../../services/dataService';
import { useChartTheme } from '../common/ChartHelpers';
import { useQuery } from '../../services/queryClient';
import { Loader2 } from 'lucide-react';

interface RiskChartData {
    name: string;
    value: number;
    color: string;
}

interface ComplianceMetrics {
    high: number;
    missingDocs: number;
    violations: number;
}

export const ComplianceOverview: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();
  
  const { data: riskData = [], isLoading: loadingRiskData } = useQuery<RiskChartData[]>(
      ['compliance', 'riskStats'], 
      DataService.compliance.getRiskStats as any
  );

  const { data: metrics, isLoading: loadingMetrics } = useQuery<ComplianceMetrics>(
      ['compliance', 'riskMetrics'], 
      DataService.compliance.getRiskMetrics
  );

  if (loadingRiskData || loadingMetrics) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600"/></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard 
            label="Compliance Score" 
            value="94/100" 
            icon={ShieldAlert}
            trend="+2% vs Last Qtr"
            trendUp={true}
            className="border-l-4 border-l-emerald-500"
         />
         <MetricCard 
            label="Pending Conflicts" 
            value={metrics?.high || 0} 
            icon={AlertTriangle}
            trend="Needs Review"
            trendUp={false}
            className="border-l-4 border-l-amber-500"
         />
         <MetricCard 
            label="Active Walls" 
            value="12" 
            icon={FileText}
            className="border-l-4 border-l-blue-500"
         />
         <MetricCard 
            label="Policy Violations" 
            value={metrics?.violations || 0} 
            icon={CheckCircle}
            className="border-l-4 border-l-green-500"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <Card title="Client Risk Profile" className="lg:col-span-2">
            <div className="flex flex-col md:flex-row items-center">
                <div className="h-64 w-full md:w-1/2">
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
                            <Tooltip contentStyle={chartTheme.tooltipStyle}/>
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4 p-4">
                    <div className={cn("p-4 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                        <h4 className={cn("font-bold text-sm mb-2", theme.text.primary)}>High Risk Factors</h4>
                        <ul className={cn("space-y-2 text-xs", theme.text.secondary)}>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Politically Exposed Persons (PEP)</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Sanctions List Matches</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/> Missing Engagement Letters</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Card>

        {/* Recent Alerts */}
        <Card title="Recent Alerts">
            <div className="space-y-4">
                {[
                    { title: 'Conflict Hit: MegaCorp', time: '2 hours ago', severity: 'medium' },
                    { title: 'Ethical Wall Update', time: '5 hours ago', severity: 'low' },
                    { title: 'GDPR Data Request', time: 'Yesterday', severity: 'high' },
                ].map((alert, i) => (
                    <div key={i} className={cn("flex items-start p-3 rounded-lg border transition-colors", theme.surfaceHighlight, theme.border.default)}>
                        <Activity className={cn("h-4 w-4 mt-0.5 mr-3", alert.severity === 'high' ? "text-red-500" : alert.severity === 'medium' ? "text-amber-500" : "text-blue-500")} />
                        <div>
                            <p className={cn("text-sm font-bold", theme.text.primary)}>{alert.title}</p>
                            <p className={cn("text-xs", theme.text.tertiary)}>{alert.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
};
