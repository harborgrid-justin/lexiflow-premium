/**
 * JudgeAnalytics.tsx
 * 
 * Displays comprehensive analytics for judicial behavior patterns including
 * motion ruling statistics, case timeline preferences, and judicial tendencies.
 * 
 * @module components/analytics/JudgeAnalytics
 * @category Analytics - Judge Intelligence
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Gavel, Clock, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Card } from '@/components/molecules/Card/Card';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';

// Utils
import { cn } from '@/utils/cn';

// Types
import type { JudgeProfile, JudgeMotionStat } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface JudgeAnalyticsProps {
  /** Judge profile data including rulings and tendencies */
  judge: JudgeProfile;
  /** Statistical breakdown of motion rulings */
  stats: JudgeMotionStat[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * JudgeAnalytics - Judicial behavior pattern visualization
 * 
 * Provides data-driven insights into:
 * - Motion ruling patterns (grants vs. denials)
 * - Average case duration
 * - Documented judicial tendencies
 */
export const JudgeAnalytics: React.FC<JudgeAnalyticsProps> = ({ judge, stats }) => {
  // ==========================================================================
  // HOOKS - Context
  // ==========================================================================
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Judge Profile Card */}
      <Card className="lg:col-span-1 flex flex-col h-full">
        <div className="flex items-center space-x-4 mb-6">
          <div className={cn("p-4 rounded-full", theme.surface.highlight)}>
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

      {/* Motion Statistics Chart */}
      <Card className="lg:col-span-2" title="Motion Ruling Statistics">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid}/>
              <XAxis type="number" domain={[0, 100]} hide/>
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{fontSize: 11, fill: chartTheme.text}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={chartTheme.tooltipStyle}
              />
              <Legend verticalAlign="bottom" height={36}/>
              <Bar dataKey="grant" name="Granted %" stackId="a" fill={chartTheme.colors.success} radius={[0, 0, 0, 0]} barSize={24} />
              <Bar dataKey="deny" name="Denied %" stackId="a" fill={chartTheme.colors.danger} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default JudgeAnalytics;
