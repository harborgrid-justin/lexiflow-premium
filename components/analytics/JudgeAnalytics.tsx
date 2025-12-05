
import React from 'react';
import { Card } from '../common/Card';
import { Gavel, Clock, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { JudgeProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface JudgeAnalyticsProps {
  judge: JudgeProfile;
  stats: any[];
}

export const JudgeAnalytics: React.FC<JudgeAnalyticsProps> = ({ judge, stats }) => {
  const { theme, mode } = useTheme();

  const chartColors = {
    text: mode === 'dark' ? '#94a3b8' : '#64748b',
    grid: mode === 'dark' ? '#334155' : '#e2e8f0',
    tooltipBg: mode === 'dark' ? '#1e293b' : '#ffffff',
    tooltipBorder: mode === 'dark' ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <Card className="lg:col-span-1 flex flex-col h-full">
        <div className="flex items-center space-x-4 mb-6">
          <div className={cn("p-4 rounded-full", theme.surfaceHighlight)}>
            <Gavel className={cn("h-8 w-8", theme.text.primary)}/>
          </div>
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>{judge.name}</h3>
            <p className={cn("text-sm", theme.text.secondary)}>{judge.court}</p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          <div className={cn("p-4 rounded-lg border", theme.primary.light, theme.primary.border)}>
            <p className={cn("text-xs uppercase font-bold mb-1 flex items-center", theme.primary.text)}>
                <Clock className="h-3 w-3 mr-1"/> Avg. Time to Trial
            </p>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>{judge.avgCaseDuration} Days</p>
          </div>
          
          <div>
            <h4 className={cn("font-semibold text-sm mb-3", theme.text.primary)}>Judicial Tendencies</h4>
            <ul className="space-y-2">
              {judge.tendencies.map((t, i) => (
                <li key={i} className={cn("text-sm flex items-start", theme.text.secondary)}>
                    <Scale className="h-4 w-4 mr-2 shrink-0 mt-0.5 opacity-50"/>
                    {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2" title="Motion Ruling Statistics">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartColors.grid}/>
              <XAxis type="number" domain={[0, 100]} hide/>
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{fontSize: 11, fill: chartColors.text}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    borderColor: chartColors.tooltipBorder, 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
              <Bar dataKey="grant" name="Granted %" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} />
              <Bar dataKey="deny" name="Denied %" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
