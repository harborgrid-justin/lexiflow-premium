/**
 * SettlementCalculator.tsx
 * 
 * Monte Carlo simulation engine for settlement value forecasting.
 * Runs probabilistic simulations to determine expected value ranges
 * and optimal settlement targets based on case parameters.
 * 
 * @module components/analytics/SettlementCalculator
 * @category Analytics - Settlement Modeling
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Card } from '../../common/Card';
import { Input } from '../../common/Inputs';
import { Button } from '../../common/Button';

// Hooks & Context
import { useTheme, ThemeContextType } from '../../../context/ThemeContext';
import { useChartTheme } from '../../common/ChartHelpers';
import { useSettlementSimulation } from '../../../hooks/useSettlementSimulation';

// Utils & Services
import { cn } from '../../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SimulationParametersPanelProps {
  low: number;
  high: number;
  liabilityProb: number;
  isCalculating: boolean;
  onLowChange: (value: number) => void;
  onHighChange: (value: number) => void;
  onLiabilityProbChange: (value: number) => void;
  onRunSimulation: () => void;
  theme: ThemeContextType['theme'];
}

interface SimulationResultsChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  metrics: { ev: number; p25: number; p75: number };
  iterations: number;
  theme: ThemeContextType['theme'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartTheme: any;
}

interface SimulationMetricsDisplayProps {
  metrics: { ev: number; p25: number; p75: number };
  theme: ThemeContextType['theme'];
}

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * SimulationParametersPanel - Input controls for simulation parameters
 */
const SimulationParametersPanel: React.FC<SimulationParametersPanelProps> = ({
  low,
  high,
  liabilityProb,
  isCalculating,
  onLowChange,
  onHighChange,
  onLiabilityProbChange,
  onRunSimulation,
  theme
}) => (
  <Card className="flex flex-col h-full">
    <div className={cn("flex items-center gap-2 mb-4", theme.text.link)}>
      <Calculator className="h-5 w-5"/>
      <h3 className="font-bold">Simulation Parameters</h3>
    </div>
    <div className="space-y-4 flex-1">
      <Input 
        label="Low Estimate ($)" 
        type="number" 
        value={low} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLowChange(Number(e.target.value))} 
      />
      <Input 
        label="High Estimate ($)" 
        type="number" 
        value={high} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onHighChange(Number(e.target.value))} 
      />
      <div>
        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>
          Liability Probability ({liabilityProb}%)
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={liabilityProb} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLiabilityProbChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="pt-4">
        <Button 
          variant="primary" 
          className="w-full" 
          icon={isCalculating ? RefreshCw : Calculator} 
          onClick={onRunSimulation}
          isLoading={isCalculating}
        >
          {isCalculating ? 'Running Monte Carlo...' : 'Run Simulation'}
        </Button>
      </div>
    </div>
  </Card>
);

/**
 * SimulationMetricsDisplay - Bottom metrics row
 */
const SimulationMetricsDisplay: React.FC<SimulationMetricsDisplayProps> = ({ metrics, theme }) => {
  const recommendedSettlement = ((metrics.ev + metrics.p75) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 });
  
  return (
    <div className={cn("grid grid-cols-3 gap-4 mt-6 pt-4 border-t", theme.border.default)}>
      <div className="text-center">
        <p className={cn("text-xs uppercase", theme.text.secondary)}>Conservative (P25)</p>
        <p className={cn("font-bold", theme.text.primary)}>
          ${metrics.p25.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className={cn("text-center border-x", theme.border.default)}>
        <p className={cn("text-xs uppercase", theme.text.secondary)}>Aggressive (P75)</p>
        <p className={cn("font-bold", theme.text.primary)}>
          ${metrics.p75.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="text-center flex flex-col items-center justify-center">
        <div className="flex items-center text-green-600 text-xs font-bold">
          <TrendingUp className="h-3 w-3 mr-1"/> Recommendation
        </div>
        <p className={cn("font-bold text-sm", theme.text.primary)}>
          Settle ${recommendedSettlement}
        </p>
      </div>
    </div>
  );
};

/**
 * SimulationResultsChart - Distribution chart with metrics
 */
const SimulationResultsChart: React.FC<SimulationResultsChartProps> = ({
  results,
  metrics,
  iterations,
  theme,
  chartTheme
}) => (
  <Card className="lg:col-span-2 flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className={cn("text-lg font-bold", theme.text.primary)}>Settlement Value Forecast</h3>
        <p className={cn("text-sm", theme.text.secondary)}>
          Distribution of {iterations} potential trial outcomes.
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Expected Value (EV)</p>
        <p className={cn("text-2xl font-mono font-bold text-emerald-600")}>
          ${metrics.ev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>

    <div className="flex-1 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={results} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.success} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={chartTheme.colors.success} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} stroke={chartTheme.text} />
          <YAxis hide />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <Tooltip 
            cursor={{stroke: chartTheme.colors.success, strokeWidth: 1}}
            contentStyle={chartTheme.tooltipStyle}
          />
          <Area type="monotone" dataKey="count" stroke={chartTheme.colors.success} fillOpacity={1} fill="url(#colorCount)" />
          <ReferenceLine 
            x={results.find(r => r.value >= metrics.ev)?.range} 
            stroke={chartTheme.colors.danger} 
            strokeDasharray="3 3" 
            label="EV" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <SimulationMetricsDisplay metrics={metrics} theme={theme} />
  </Card>
);

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * SettlementCalculator - Container component for Monte Carlo settlement simulation
 * 
 * Uses useSettlementSimulation hook for business logic
 * Composed of presentation components for clean separation
 * 
 * Features:
 * - Configurable damage range and liability probability
 * - 1,000+ iteration Monte Carlo simulation
 * - Visual distribution of potential outcomes
 * - Expected value and percentile calculations
 * - Strategic settlement recommendations
 */
export const SettlementCalculator: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();
  
  const {
    params,
    updateParam,
    isCalculating,
    results,
    metrics,
    runSimulation
  } = useSettlementSimulation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <SimulationParametersPanel
        low={params.low}
        high={params.high}
        liabilityProb={params.liabilityProb}
        isCalculating={isCalculating}
        onLowChange={(value) => updateParam('low', value)}
        onHighChange={(value) => updateParam('high', value)}
        onLiabilityProbChange={(value) => updateParam('liabilityProb', value)}
        onRunSimulation={runSimulation}
        theme={theme}
      />
      <SimulationResultsChart
        results={results}
        metrics={metrics}
        iterations={params.iterations}
        theme={theme}
        chartTheme={chartTheme}
      />
    </div>
  );
};
