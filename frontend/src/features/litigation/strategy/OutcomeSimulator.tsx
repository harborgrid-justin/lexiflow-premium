
/**
 * @module components/litigation/OutcomeSimulator
 * @category Litigation
 * @description Monte Carlo simulation for outcome forecasting.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme and useChartTheme hooks for visualizations.
 */

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';

// Internal Components
import { Card } from '@/components/molecules';
import { Input } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { useChartTheme } from '@/components/organisms';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils
import { cn } from '@/utils/cn';
import { SimulationEngine } from '@/utils/simulationEngine';
import { Scheduler } from '@/utils/scheduler';
import { formatCurrency } from '@/utils/formatUtils';

export const OutcomeSimulator: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();
  const [low, setLow] = useState(500000);
  const [high, setHigh] = useState(1500000);
  const [liabilityProb, setLiabilityProb] = useState(75);
  const [iterations, setIterations] = useState(1000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<unknown[]>([]);
  const [metrics, setMetrics] = useState({ ev: 0, p25: 0, p75: 0 });

  const runSimulation = () => {
    setIsCalculating(true);
    
    // Offload heavy calculation to scheduler to unblock UI
    Scheduler.scheduleTask(() => {
        return SimulationEngine.runSettlementSimulation({ low, high, liabilityProb, iterations });
    }).then(simulationResults => {
        setResults(simulationResults.results);
        setMetrics({ ev: simulationResults.ev, p25: simulationResults.p25, p75: simulationResults.p75 });
        setIsCalculating(false);
    });
  };

  // Initial run
  useMemo(() => {
    if (results.length === 0) runSimulation();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
           <Calculator className="h-5 w-5"/>
           <h3 className="font-bold">Simulation Parameters</h3>
        </div>
        <div className="space-y-4 flex-1">
           <Input 
             label="Low Estimate ($)" 
             type="number" 
             value={low} 
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLow(Number(e.target.value))} 
           />
           <Input 
             label="High Estimate ($)" 
             type="number" 
             value={high} 
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHigh(Number(e.target.value))} 
           />
           <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Liability Probability ({liabilityProb}%)</label>
              <input 
                type="range" 
                min="0" max="100" 
                value={liabilityProb} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLiabilityProb(Number(e.target.value))}
                className="w-full"
              />
           </div>
           <div className="pt-4">
             <Button 
               variant="primary" 
               className="w-full" 
               icon={isCalculating ? RefreshCw : Calculator} 
               onClick={runSimulation}
               isLoading={isCalculating}
             >
               {isCalculating ? 'Running Monte Carlo...' : 'Run Simulation'}
             </Button>
           </div>
        </div>
      </Card>

      <Card className="lg:col-span-2 flex flex-col">
         <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className={cn("text-lg font-bold", theme.text.primary)}>Settlement Value Forecast</h3>
                <p className={cn("text-sm", theme.text.secondary)}>Distribution of {iterations} potential trial outcomes.</p>
            </div>
            <div className="text-right">
                <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Expected Value (EV)</p>
                <p className={cn("text-2xl font-mono font-bold text-emerald-600")}>
                    ${metrics.ev.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </p>
            </div>
         </div>

         <div className="flex-1" style={{ minHeight: '300px' }}>
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
                <ReferenceLine x={results.find(r => r.value >= metrics.ev)?.range} stroke={chartTheme.colors.danger} strokeDasharray="3 3" label="EV" />
              </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className={cn("grid grid-cols-3 gap-4 mt-6 pt-4 border-t", theme.border.default)}>
            <div className="text-center">
                <p className={cn("text-xs uppercase", theme.text.secondary)}>Conservative (P25)</p>
                <p className={cn("font-bold", theme.text.primary)}>${metrics.p25.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className={cn("text-center border-x", theme.border.default)}>
                <p className={cn("text-xs uppercase", theme.text.secondary)}>Aggressive (P75)</p>
                <p className={cn("font-bold", theme.text.primary)}>${metrics.p75.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
                <div className="flex items-center text-green-600 text-xs font-bold">
                    <TrendingUp className="h-3 w-3 mr-1"/> Recommendation
                </div>
                <p className={cn("font-bold text-sm", theme.text.primary)}>Settle ${((metrics.ev + metrics.p75)/2).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
         </div>
      </Card>
    </div>
  );
};
export default OutcomeSimulator;
