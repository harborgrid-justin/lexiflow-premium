
import React from 'react';
import { MetricCard } from '../../common/Primitives';
import { Card } from '../../common/Card';
import { Database, Activity, HardDrive, Server } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useChartTheme } from '../../common/ChartHelpers';

const trafficData = Array.from({ length: 20 }, (_, i) => ({
    time: i, value: Math.floor(Math.random() * 1000) + 500
}));

export const PlatformOverview: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Data Infrastructure</h2>
            <div className="flex gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>Production</span>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", theme.status.info.bg, theme.status.info.text, theme.status.info.border)}>US-East-1</span>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard label="Total Records" value="2.4M" icon={Database} className="border-l-4 border-l-blue-600" />
            <MetricCard label="Throughput" value="1.2GB/s" icon={Activity} className="border-l-4 border-l-green-600" trend="+15%" trendUp={true}/>
            <MetricCard label="Storage Used" value="450TB" icon={HardDrive} className="border-l-4 border-l-purple-600" />
            <MetricCard label="Active Nodes" value="12" icon={Server} className="border-l-4 border-l-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Live Query Traffic" className="lg:col-span-2 overflow-hidden">
                <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={chartTheme.tooltipStyle} />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="System Health">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className={cn("text-sm", theme.text.secondary)}>Master DB (Postgres)</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={cn("text-sm", theme.text.secondary)}>Search Cluster (Elastic)</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={cn("text-sm", theme.text.secondary)}>Redis Cache</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.warning.bg, theme.status.warning.text)}>Warn (High Mem)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={cn("text-sm", theme.text.secondary)}>Vector Store (Pinecone)</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", theme.status.success.bg, theme.status.success.text)}>Healthy</span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
