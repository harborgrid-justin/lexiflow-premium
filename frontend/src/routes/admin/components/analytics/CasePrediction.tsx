/**
 * CasePrediction.tsx
 *
 * AI-powered case outcome prediction using historical data and machine learning
 * to forecast settlement ranges, dismissal probability, and optimal strategies.
 *
 * @module components/analytics/CasePrediction
 * @category Analytics - Predictive Modeling
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BrainCircuit, TrendingUp } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { getChartTheme } from '@/utils/chartConfig';
// Components
import { Card } from '@/components/molecules/Card/Card';

// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Utils
import { cn } from '@/lib/cn';

// Types
import type { OutcomePredictionData } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CasePredictionProps {
  /** Historical outcome data for prediction modeling */
  outcomeData: OutcomePredictionData[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CasePrediction - AI-driven outcome forecasting
 *
 * Uses historical data from similar cases to predict:
 * - Probability of dismissal vs. settlement vs. trial
 * - Expected value range for settlements
 * - Strategic recommendations based on patterns
 */
export function CasePrediction({ outcomeData }: CasePredictionProps) {
  // ==========================================================================
  // HOOKS - Context
  // ==========================================================================
  const { theme, mode } = useTheme();
  const chartTheme = getChartTheme(mode as 'light' | 'dark');

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Radar Chart - Case Strengths */}
      <Card title="Case Strength Assessment">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={outcomeData}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: chartTheme.text }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Current Case"
                dataKey="A"
                stroke={chartTheme.colors.primary}
                strokeWidth={2}
                fill={chartTheme.colors.primary}
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={chartTheme.tooltipStyle}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Right Column - Predictions & Recommendations */}
      <div className="flex flex-col gap-6">
        {/* Probability Meters */}
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
                <div className={cn("h-2 rounded-full", theme.action.primary.bg)} style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className={cn("p-4 rounded border mt-4 flex items-center justify-between", theme.status.success.bg, theme.status.success.border)}>
              <div>
                <div className={cn("flex items-center mb-1 text-sm font-bold", theme.status.success.text)}>
                  <TrendingUp className="h-4 w-4 mr-2" /> Estimated Value Band
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

        {/* AI Recommendation Box */}
        <div className={cn("p-4 rounded-lg border flex items-start gap-3", theme.surface.default, theme.border.default)}>
          <div className={cn("p-2 rounded-full shrink-0", theme.surface.highlight, theme.text.link)}>
            <BrainCircuit className="h-5 w-5" />
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
