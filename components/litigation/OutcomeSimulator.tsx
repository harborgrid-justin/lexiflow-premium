
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RiskMeter } from '../common/RiskMeter';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
// FIX: Added missing 'Search' import from lucide-react.
import { Play, RotateCcw, TrendingUp, DollarSign, Gavel, Users, Scale, AlertTriangle, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { useChartTheme } from '../common/ChartHelpers';
import { SimulationEngine } from '../../utils/simulationEngine';
import { Scheduler } from '../../utils/scheduler';

export const OutcomeSimulator: React.FC = () => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();
  
  // Simulation Parameters
  const [params, setParams] = useState({
      caseStrength: 65,
      evidenceQuality: 70,
      opposingCounsel: 80, // Aggression/Skill
      judgeTendency: 50, // 0 = Plaintiff, 100 = Defense
      jurisdictionRisk: 40
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Result State
  const [results, setResults] = useState<any>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // Offload heavy calculation to scheduler to unblock UI
    Scheduler.scheduleTask(() => {
        return SimulationEngine.runSettlementSimulation({ low: 500000, high: 1500000, liabilityProb: params.caseStrength, iterations: 5000 });
    }).then(simulationResults => {
        const winProb = params.caseStrength; // Simplified mapping
        const settlementEV = simulationResults.ev;
        const trialEV = settlementEV * 1.3;
        const outcomes = [
              { name: 'Summary Judgment', value: 20, color: '#3b82f6' },
              { name: 'Settlement', value: 65, color: '#10b981' },
              { name: 'Trial Verdict', value: 15, color: '#f59e0b' },
          ];

        setResults({
            winProb,
            settlementEV,
            trialEV,
            duration: 12 + Math.round(params.opposingCounsel / 10),
            outcomes,
            distribution: simulationResults.results
        });
        
        setIsSimulating(false);
        setHasRun(true);
    });
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const InputSlider = ({ label, value, onChange, icon: Icon, color }: any) => (
      <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
              <span className={cn("font-medium flex items-center gap-2", theme.text.secondary)}>
                  <Icon className={cn("h-4 w-4", color)}/> {label}
              </span>
              <span className={cn("font-bold", theme.text.primary)}>{value}%</span>
          </div>
          <input 
              type="range" 
              min="0" max="100" 
              value={value} 
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
      </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Sidebar Controls */}
        <div className={cn("w-full lg:w-80 border-r p-6 flex flex-col overflow-y-auto shrink-0 bg-slate-50/50", theme.border.default)}>
            <div className="mb-6">
                <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text.primary)}>
                    <Scale className="h-5 w-5 text-indigo-600"/> Variables
                </h3>
                <p className={cn("text-xs mt-1", theme.text.secondary)}>Adjust case parameters to forecast outcomes.</p>
            </div>

            <div className="space-y-6 flex-1">
                <InputSlider label="Case Strength" value={params.caseStrength} onChange={(v:number) => setParams({...params, caseStrength: v})} icon={TrendingUp} color="text-green-600" />
                <InputSlider label="Evidence Quality" value={params.evidenceQuality} onChange={(v:number) => setParams({...params, evidenceQuality: v})} icon={Search} color="text-blue-600" />
                <InputSlider label="Opposition Skill" value={params.opposingCounsel} onChange={(v:number) => setParams({...params, opposingCounsel: v})} icon={Users} color="text-red-600" />
                <InputSlider label="Jurisdiction Risk" value={params.jurisdictionRisk} onChange={(v:number) => setParams({...params, jurisdictionRisk: v})} icon={Gavel} color="text-amber-600" />
            </div>

            <div className="mt-8 pt-6 border-t space-y-3">
                <Button 
                    variant="primary" 
                    className="w-full h-12 text-base shadow-lg shadow-blue-500/20" 
                    icon={isSimulating ? undefined : Play}
                    onClick={runSimulation}
                    disabled={isSimulating}
                    isLoading={isSimulating}
                >
                    {isSimulating ? 'Running Monte Carlo...' : 'Run Simulation'}
                </Button>
                {hasRun && (
                    <Button variant="ghost" className="w-full text-slate-500" icon={RotateCcw} onClick={() => setHasRun(false)}>Reset</Button>
                )}
            </div>
        </div>

        {/* Results Area */}
        <div className={cn("flex-1 overflow-y-auto p-6 md:p-8", theme.surface)}>
            {(!hasRun || !results) && !isSimulating ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-60">
                    <TrendingUp className="h-16 w-16 mb-6 text-slate-300"/>
                    <h3 className="text-xl font-bold text-slate-700">Ready to Forecast</h3>
                    <p className="text-slate-500 mt-2">Adjust variables and run the simulation to see AI-predicted case outcomes.</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card title="Win Probability" className="border-t-4 border-t-green-500 items-center justify-center flex flex-col"><div className="text-5xl font-bold">{results.winProb}%</div></Card>
                        <Card title="Expected Value (EV)" className="border-t-4 border-t-blue-500"><div className="space-y-4 pt-2"><div><p className="text-xs font-medium text-slate-500 uppercase mb-1">Settlement</p><p className="text-2xl font-mono font-bold text-blue-600">${results.settlementEV.toLocaleString()}</p></div><div className="pt-2 border-t border-dashed"> <p className="text-xs font-medium text-slate-500 uppercase mb-1">Trial Verdict</p><p className="text-2xl font-mono font-bold text-indigo-600">${results.trialEV.toLocaleString()}</p></div></div></Card>
                        <Card title="Est. Duration" className="border-t-4 border-t-amber-500"><div className="flex flex-col items-center justify-center h-full py-4"><p className="text-4xl font-bold">{results.duration}</p><p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Months</p>{results.duration > 18 && (<div className="mt-4 flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"><AlertTriangle className="h-3 w-3 mr-1"/> High Delay Risk</div>)}</div></Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Outcome Distribution"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={results.outcomes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{results.outcomes.map((e:any, i:number) => (<Cell key={`cell-${i}`} fill={e.color} />))}</Pie><RechartsTooltip /><text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-slate-500">Probable Result</text></PieChart></ResponsiveContainer></div></Card>
                        <Card title="Verdict Value Probability"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={results.distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} /><YAxis hide /><CartesianGrid vertical={false} strokeDasharray="3 3" /><RechartsTooltip /><Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" /></AreaChart></ResponsiveContainer></div></Card>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default OutcomeSimulator;
