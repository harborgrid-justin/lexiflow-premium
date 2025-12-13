import React from 'react';
import { Card } from '../common/Card';
import { TrendingUp, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { OutcomePredictionData } from '../../types';
import { useChartTheme } from '../common/ChartHelpers';

interface CasePredictionProps {
  outcomeData: OutcomePredictionData[];
}

export const CasePrediction: React.FC<CasePredictionProps> = ({ outcomeData }) => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card title="Case Strength Assessment">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={outcomeData}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fill: chartTheme.text}} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
              <Radar 
                name="Current Case" 
                dataKey="A" 
                stroke={chartTheme.colors.purple} 
                strokeWidth={2}
                fill={chartTheme.colors.purple} 
                fillOpacity={0.5} 
              />
              <Tooltip 
                contentStyle={chartTheme.tooltipStyle}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card title="Outcome Forecast">
            <div className="space-y-6">
            <div>
                <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                    <span>Probability of Dismissal</span>
                    <span className="font-bold">24%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", theme.surface.highlight)}>
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
            </div>
            <div>
                <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                    <span>Probability of Settlement</span>
                    <span className="font-bold">68%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", theme.surface.highlight)}>
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
            </div>
            
            <div className={cn("p-4 rounded border mt-4 flex items-center justify-between", theme.status.success.bg, theme.status.success.border)}>
                <div>
                    <div className={cn("flex items-center mb-1 text-sm font-bold", theme.status.success.text)}>
                        <TrendingUp className="h-4 w-4 mr-2"/> Estimated Value Band
                    </div>
                    <p className={cn("text-2xl font-mono font-bold", theme.text.primary)}>$1.2M - $1.8M</p>
                </div>
                <div className="text-right">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded bg-white/50", theme.status.success.text)}>+15% Confidence</span>
                </div>
            </div>
            <p className={cn("text-xs mt-1 text-center", theme.text.tertiary)}>Based on 45 similar cases in CA Superior Court</p>
            </div>
        </Card>

        <div className={cn("p-4 rounded-lg border flex items-start gap-3", theme.surface.default, theme.border.default)}>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600 shrink-0">
                <BrainCircuit className="h-5 w-5"/>
            </div>
            <div>
                <h4 className={cn("font-bold text-sm", theme.text.primary)}>AI Recommendation</h4>
                <p className={cn("text-sm mt-1", theme.text.secondary)}>
                    Strong evidence on liability suggests pursuing early mediation. Defense counsel has high settlement rate pre-trial.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CasePrediction;
