
import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RiskMeter } from '../common/RiskMeter';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Play, RotateCcw, TrendingUp, DollarSign, Gavel, Users, Scale, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

export const OutcomeSimulator: React.FC = () => {
  const { theme } = useTheme();
  
  // Simulation Parameters
  const [params, setParams] = useState({
      caseStrength: 65,
      evidenceQuality: 70,
      opposingCounsel: 80, // Aggression/Skill
      judgeTendency: 50, // 0 = Plaintiff, 100 = Defense (or vice versa depending on perspective)
      jurisdictionRisk: 40
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Result State
  const [results, setResults] = useState<{
      winProb: number;
      settlementEV: number;
      trialEV: number;
      duration: number;
      outcomes: { name: string; value: number; color: string }[];
      distribution: { range: string; value: number }[];
  } | null>(null);

  const runSimulation = () => {
      setIsSimulating(true);
      
      // Monte Carlo Approximation logic
      setTimeout(() => {
          // Base Probability from inputs
          const baseWin = (params.caseStrength * 0.4) + (params.evidenceQuality * 0.3) + ((100 - params.opposingCounsel) * 0.2) + ((100 - params.jurisdictionRisk) * 0.1);
          
          // Introduce variance
          const winProb = Math.min(95, Math.max(5, Math.round(baseWin + (Math.random() * 10 - 5))));
          
          const settlementEV = Math.round((winProb / 100) * 1500000 * (1 - (params.opposingCounsel/200)));
          const trialEV = Math.round((winProb / 100) * 2200000 * (params.jurisdictionRisk > 50 ? 0.8 : 1.2));
          
          // Generate outcome distribution
          const outcomes = [
              { name: 'Summary Judgment', value: Math.max(5, 20 + (params.caseStrength - 50)/2), color: '#3b82f6' },
              { name: 'Settlement', value: Math.max(10, 50 + (params.opposingCounsel - 50)/2), color: '#10b981' },
              { name: 'Trial Verdict', value: Math.max(5, 30 - (params.evidenceQuality/5)), color: '#f59e0b' },
          ];
          
          // Normalize to 100%
          const total = outcomes.reduce((a,b) => a + b.value, 0);
          outcomes.forEach(o => o.value = Math.round((o.value / total) * 100));

          // Generate Bell Curve for Financials
          const distribution = Array.from({length: 10}, (_, i) => {
             const x = i - 5;
             const val = Math.exp(-(x*x)/2); // Gaussian
             return { range: `$${(i*200)}k`, value: val * 100 + (Math.random() * 20) };
          });

          setResults({
              winProb,
              settlementEV,
              trialEV,
              duration: 12 + Math.round(params.opposingCounsel / 10),
              outcomes,
              distribution
          });
          
          setIsSimulating(false);
          setHasRun(true);
      }, 1500);
  };

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
                <InputSlider label="Opposition Aggression" value={params.opposingCounsel} onChange={(v:number) => setParams({...params, opposingCounsel: v})} icon={Users} color="text-red-600" />
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
            {!hasRun && !isSimulating ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-60">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="h-10 w-10 text-slate-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">Ready to Forecast</h3>
                    <p className="text-slate-500 mt-2">Adjust the variables on the left and run the simulation to see AI-predicted case outcomes based on historical data.</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card title="Win Probability" className="border-t-4 border-t-green-500">
                            <div className="flex items-center justify-center py-4">
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="60" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                                        <circle cx="64" cy="64" r="60" stroke={results!.winProb > 50 ? "#22c55e" : "#f59e0b"} strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * results!.winProb) / 100} className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-800">
                                        {results!.winProb}%
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Expected Value (EV)" className="border-t-4 border-t-blue-500">
                            <div className="space-y-4 pt-2">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Settlement</p>
                                    <p className="text-2xl font-mono font-bold text-blue-600">${results!.settlementEV.toLocaleString()}</p>
                                </div>
                                <div className="pt-2 border-t border-dashed">
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Trial Verdict</p>
                                    <p className="text-2xl font-mono font-bold text-indigo-600">${results!.trialEV.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>

                        <Card title="Est. Duration" className="border-t-4 border-t-amber-500">
                             <div className="flex flex-col items-center justify-center h-full py-4">
                                 <p className="text-4xl font-bold text-slate-800">{results!.duration}</p>
                                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Months</p>
                                 
                                 {results!.duration > 18 && (
                                     <div className="mt-4 flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                         <AlertTriangle className="h-3 w-3 mr-1"/> High Delay Risk
                                     </div>
                                 )}
                             </div>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Outcome Distribution">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={results!.outcomes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {results!.outcomes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-slate-500">
                                            Probable Result
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 text-xs mt-2">
                                    {results!.outcomes.map(o => (
                                        <div key={o.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: o.color}}></div>
                                            <span>{o.name} ({o.value}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card title="Verdict Value Probability">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={results!.distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const Search = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
