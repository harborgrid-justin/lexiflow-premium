
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MetricCard } from '../common/Primitives';
import { ShieldCheck, AlertTriangle, HardDrive, Box, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { EvidenceItem } from '../../types';
import { ViewMode } from '../../hooks/useEvidenceVault';

interface EvidenceDashboardProps {
  onNavigate: (view: ViewMode) => void;
}

export const EvidenceDashboard: React.FC<EvidenceDashboardProps> = ({ onNavigate }) => {
  const { theme, mode } = useTheme();
  const [stats, setStats] = useState({ total: 0, digital: 0, physical: 0, challenged: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
      const loadData = async () => {
          const evidence = await DataService.evidence.getAll();
          setStats({
              total: evidence.length,
              digital: evidence.filter(e => e.type === 'Digital').length,
              physical: evidence.filter(e => e.type === 'Physical').length,
              challenged: evidence.filter(e => e.admissibility === 'Challenged').length
          });

          const events = evidence.flatMap(e => 
            e.chainOfCustody.map(c => ({ ...c, itemTitle: e.title, itemId: e.id }))
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
          
          setRecentEvents(events);
      };
      loadData();
  }, []);

  const data = [
    { name: 'Physical', value: stats.physical, color: '#d97706' }, // amber-600
    { name: 'Digital', value: stats.digital, color: '#2563eb' }, // blue-600
    { name: 'Document', value: stats.total - stats.digital - stats.physical, color: '#475569' }, // slate-600
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
            label="Total Evidence" 
            value={stats.total} 
            icon={Box} 
            className="border-l-4 border-l-blue-600"
        />
        <MetricCard 
            label="Digital Assets" 
            value={stats.digital} 
            icon={HardDrive} 
            className="border-l-4 border-l-purple-600"
        />
        <MetricCard 
            label="Admissibility Risk" 
            value={stats.challenged} 
            icon={AlertTriangle} 
            className="border-l-4 border-l-amber-500"
        />
        <MetricCard 
            label="Chain Integrity" 
            value={100} 
            icon={ShieldCheck} 
            className="border-l-4 border-l-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card title="Evidence Type Distribution">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Custody Transfers">
          <div className="space-y-4">
            {recentEvents.map((evt, idx) => (
              <div key={idx} className={cn("flex items-start pb-3 border-b last:border-0 last:pb-0", theme.border.light)}>
                <div className={cn("p-2 rounded-full mr-3 shrink-0", theme.primary.light)}>
                  <Activity className={cn("h-4 w-4", theme.primary.text)} />
                </div>
                <div>
                  <p className={cn("text-sm font-medium", theme.text.primary)}>{evt.action}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>
                    <span className={cn("font-semibold", theme.text.primary)}>{evt.itemTitle}</span> • {evt.actor}
                  </p>
                  <p className={cn("text-[10px] mt-0.5", theme.text.tertiary)}>{evt.date}</p>
                </div>
              </div>
            ))}
            <div className="pt-2">
                <Button variant="ghost" size="sm" className={cn("w-full", theme.primary.text)} onClick={() => onNavigate('custody')}>
                View Full Chain of Custody Log
                </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Status */}
      <div className={cn("rounded-lg p-6 flex flex-col md:flex-row justify-between items-center shadow-lg", mode === 'dark' ? 'bg-slate-800' : 'bg-slate-900 text-white')}>
        <div>
          <h3 className="font-bold text-lg mb-1">Secure Evidence Storage</h3>
          <p className="opacity-80 text-sm">All digital assets are encrypted at rest (AES-256) and anchored to the Ethereum blockchain.</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
            <div className="text-center">
                <p className="text-xs opacity-60 uppercase">Storage Used</p>
                <p className="text-xl font-mono font-bold text-emerald-400">4.2 TB</p>
            </div>
             <div className="text-center">
                <p className="text-xs opacity-60 uppercase">Retention Policy</p>
                <p className="text-xl font-mono font-bold text-blue-400">7 Years</p>
            </div>
        </div>
      </div>
    </div>
  );
};
