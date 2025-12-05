
import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Inputs';
import { Button } from '../common/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const SettlementCalculator: React.FC = () => {
  const { theme, mode } = useTheme();
  const [low, setLow] = useState(500000);
  const [high, setHigh] = useState(1500000);
  const [liabilityProb, setLiabilityProb] = useState(75);
  const [iterations, setIterations] = useState(1000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ ev: 0, p25: 0, p75: 0 });

  const runSimulation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const data: number[] = [];
      for (let i = 0; i < iterations; i++) {
        // Simple Monte Carlo: Liability Check -> Damage Range
        const isLiable = Math.random() * 100 < liabilityProb;
        if (isLiable) {
          // Box-Muller transform for normal distribution skew within range
          const u = 1 - Math.random();
          const v = Math.random();
          const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
          
          const mean = (high + low) / 2;
          const stdDev = (high - low) / 4; // Assume 95% falls within range
          let val = mean + z * stdDev;
          
          // Clamp
          val = Math.max(low * 0.8, Math.min(high * 1.2, val));
          data.push(val);
        } else {
          data.push(0);
        }
      }
      
      data.sort((a, b) => a - b);
      
      // Calculate Metrics
      const sum = data.reduce((a, b) => a + b, 0);
      const ev = sum / iterations;
      const p25 = data[Math.floor(iterations * 0.25)];
      const p75 = data[Math.floor(iterations * 0.75)];
      
      // Build Histogram Data for Chart
      const buckets = 20;
      const minVal = 0;
      const maxVal = high * 1.2;
      const bucketSize = (maxVal - minVal) / buckets;
      
      const histData = Array.from({ length: buckets }, (_, i) => {
        const start = minVal + i * bucketSize;
        const end = start + bucketSize;
        const count = data.filter(v => v >= start && v < end).length;
        return {
          range: `$${(start/1000).toFixed(0)}k`,
          count: count,
          value: start
        };
      });

      setResults(histData);
      setMetrics({ ev, p25, p75 });
      setIsCalculating(false);
    }, 800);
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
             onChange={e => setLow(Number(e.target.value))} 
           />
           <Input 
             label="High Estimate ($)" 
             type="number" 
             value={high} 
             onChange={e => setHigh(Number(e.target.value))} 
           />
           <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Liability Probability ({liabilityProb}%)</label>
              <input 
                type="range" 
                min="0" max="100" 
                value={liabilityProb} 
                onChange={e => setLiabilityProb(Number(e.target.value))}
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

      <Card className="lg:col-span-2 flex flex-col h-full">
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

         <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} stroke={theme.text.secondary.replace('text-', '')} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <Tooltip 
                  cursor={{stroke: '#10b981', strokeWidth: 1}}
                  contentStyle={{ 
                      backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                      borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '8px', 
                      color: mode === 'dark' ? '#f8fafc' : '#1e293b'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
                <ReferenceLine x={results.find(r => r.value >= metrics.ev)?.range} stroke="red" strokeDasharray="3 3" label="EV" />
              </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className={cn("grid grid-cols-3 gap-4 mt-6 pt-4 border-t", theme.border.light)}>
            <div className="text-center">
                <p className={cn("text-xs uppercase", theme.text.secondary)}>Conservative (P25)</p>
                <p className={cn("font-bold", theme.text.primary)}>${metrics.p25.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className={cn("text-center border-x", theme.border.light)}>
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
