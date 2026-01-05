
import React from 'react';
import { 
  DollarSign, CreditCard, TrendingUp, Activity, ArrowUpRight, ArrowDownLeft, 
  Landmark, Briefcase, Signal, Clock
} from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignFinance = () => {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
        <SectionHeading title="Finance & Banking" icon={DollarSign} count="FIN-01 to FIN-20" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <DemoContainer className="lg:col-span-2 row-span-2">
                <ComponentLabel id="FIN-01" name="Premium Corporate Card" />
                <div className="relative h-56 w-full max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-6 text-white shadow-2xl overflow-hidden group transition-all duration-500 hover:shadow-blue-900/20 hover:scale-[1.02] cursor-pointer ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-blue-400/20 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-10 -mb-10 blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md shadow-inner border border-yellow-300/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-black/20"></div>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-lg italic tracking-widest text-white/90 drop-shadow-md font-serif">LEXIFLOW</span>
                                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-sans">Business Elite</div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="flex gap-3 items-center justify-start">
                                <span className="font-mono text-xl tracking-widest text-slate-100 drop-shadow-md tabular-nums">4242</span>
                                <span className="font-mono text-xl tracking-widest text-slate-400/50 drop-shadow-md">••••</span>
                                <span className="font-mono text-xl tracking-widest text-slate-400/50 drop-shadow-md">••••</span>
                                <span className="font-mono text-xl tracking-widest text-slate-100 drop-shadow-md tabular-nums">9921</span>
                             </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <div className="uppercase text-[8px] tracking-[0.2em] text-slate-400 font-bold mb-1">Cardholder</div>
                                <div className="font-medium tracking-wider text-sm text-slate-100 shadow-black drop-shadow-sm">ALEXANDRA HAMILTON</div>
                            </div>
                            <div className="text-right">
                                <div className="uppercase text-[8px] tracking-[0.2em] text-slate-400 font-bold mb-1">Valid Thru</div>
                                <div className="font-mono font-medium text-sm text-white">12/28</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-02" name="Compact Debit" />
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-4 text-white shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-indigo-500/25 transition-all">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <span className="font-bold text-[10px] uppercase tracking-wider opacity-90 border border-white/20 px-1.5 py-0.5 rounded">Debit</span>
                        <Signal className="h-4 w-4 opacity-80" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-lg font-mono tracking-widest mb-1 shadow-black/10 drop-shadow-sm opacity-90 group-hover:opacity-100">•••• 8842</div>
                        <div className="flex justify-between items-end">
                             <div className="flex flex-col">
                                <span className="text-[9px] opacity-70 uppercase tracking-wide">Available</span>
                                <span className="font-bold text-sm tabular-nums tracking-tight">$2,450.00</span>
                             </div>
                             <div className="w-8 h-5 bg-white/20 rounded-sm backdrop-blur-sm border border-white/10"></div>
                        </div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-03" name="Account List Row" />
                <div className="flex items-center p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors shrink-0 shadow-sm">
                        <Landmark className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">Operating Trust</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center mt-0.5">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-1.5"></span>
                            Ref: 4921-88
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                        <div className="text-sm font-bold text-slate-900 tabular-nums">$12,450.00</div>
                        <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                           Active
                        </span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-04" name="Financial KPI" />
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all w-full group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate pr-2">Net Realization</div>
                        <Activity className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"/>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <div className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">94.2%</div>
                        <div className="inline-flex items-center text-emerald-700 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            <TrendingUp className="h-3 w-3 mr-1"/> 2.4%
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-slate-800 w-[94%] rounded-full group-hover:bg-blue-600 transition-colors"></div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-05" name="Transaction (Debit)" />
                <div className="flex items-center justify-between py-2 px-2 border-b border-slate-100 hover:bg-slate-50 rounded transition-colors cursor-default group w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm group-hover:border-slate-300 shrink-0 group-hover:bg-white"><Briefcase size={16}/></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">LexisNexis Research</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">Software • Today, 2:30 PM</div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 tabular-nums whitespace-nowrap ml-3">-$450.00</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-06" name="Transaction (Credit)" />
                <div className="flex items-center justify-between py-2 px-2 border-b border-slate-100 hover:bg-emerald-50/30 rounded transition-colors cursor-default group w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shadow-sm shrink-0 group-hover:bg-white"><ArrowDownLeft size={16}/></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">Retainer Deposit</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">TechCorp Inc • Yesterday</div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 tabular-nums whitespace-nowrap ml-3">+$5,000.00</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FIN-07" name="Transaction (Pending)" />
                <div className="flex items-center justify-between py-2 px-2 border-b border-slate-100 opacity-70 hover:opacity-100 transition-opacity w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-400 shrink-0 border border-transparent"><Clock size={16} /></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-700 italic truncate">Uber Technologies</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">Travel • Pending Auth</div>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap ml-3">-$24.50</span>
                </div>
            </DemoContainer>

        </div>
    </div>
  );
};
