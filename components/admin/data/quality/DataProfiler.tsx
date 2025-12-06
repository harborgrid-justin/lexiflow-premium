
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../../../common/Card';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { useChartTheme } from '../../../common/ChartHelpers';
import { Hash, AlignLeft, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

const MOCK_PROFILES = [
  {
    column: 'status',
    type: 'string',
    nulls: 0.5,
    unique: 8,
    distribution: [
      { name: 'Active', value: 4500 },
      { name: 'Closed', value: 3200 },
      { name: 'Pending', value: 800 },
      { name: 'Archived', value: 200 },
    ]
  },
  {
    column: 'value',
    type: 'numeric',
    nulls: 0,
    unique: 1420,
    distribution: [
      { name: '0-10k', value: 1200 },
      { name: '10k-50k', value: 3500 },
      { name: '50k-100k', value: 2100 },
      { name: '100k+', value: 800 },
    ]
  },
  {
    column: 'created_at',
    type: 'datetime',
    nulls: 0,
    unique: 8500,
    distribution: [
      { name: '2021', value: 1500 },
      { name: '2022', value: 2800 },
      { name: '2023', value: 3200 },
      { name: '2024', value: 1100 },
    ]
  }
];

export const DataProfiler: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  const getIcon = (type: string) => {
      switch(type) {
          case 'numeric': return <Hash className="h-4 w-4 text-blue-500"/>;
          case 'datetime': return <Calendar className="h-4 w-4 text-purple-500"/>;
          default: return <AlignLeft className="h-4 w-4 text-slate-500"/>;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-6">
            {MOCK_PROFILES.map((profile, idx) => (
                <Card key={idx} noPadding>
                    <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded border", theme.surface, theme.border.default)}>
                                {getIcon(profile.type)}
                            </div>
                            <div>
                                <h4 className={cn("font-bold font-mono text-sm", theme.text.primary)}>{profile.column}</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>{profile.type}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="text-center">
                                <span className={cn("block font-bold", theme.text.primary)}>{profile.unique.toLocaleString()}</span>
                                <span className={theme.text.tertiary}>Unique</span>
                            </div>
                            <div className="text-center">
                                <span className={cn("block font-bold", profile.nulls > 5 ? "text-red-500" : "text-green-500")}>{profile.nulls}%</span>
                                <span className={theme.text.tertiary}>Nulls</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h5 className={cn("text-xs font-bold uppercase mb-4", theme.text.secondary)}>Value Distribution</h5>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={profile.distribution}>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke={chartTheme.text}/>
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={chartTheme.tooltipStyle}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {profile.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartTheme.colors.blue} fillOpacity={0.6 + (index * 0.1)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className={cn("p-3 border-t bg-slate-50/50 flex gap-4 text-xs", theme.border.default)}>
                         {profile.nulls === 0 ? (
                             <div className="flex items-center text-green-600"><CheckCircle2 className="h-3 w-3 mr-1"/> Completeness Check Passed</div>
                         ) : (
                             <div className="flex items-center text-amber-600"><AlertTriangle className="h-3 w-3 mr-1"/> Sparse Data Detected</div>
                         )}
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
};
