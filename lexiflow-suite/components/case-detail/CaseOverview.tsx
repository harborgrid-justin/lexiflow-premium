
import React, { useState, useTransition, useMemo } from 'react';
import { Case, TimeEntry } from '../../types.ts';
import { Clock, DollarSign, Briefcase, Link, ArrowRightLeft, TrendingUp, Activity, Plus, Gavel, MoreVertical, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { TimeEntryModal } from '../TimeEntryModal.tsx';
import { MOCK_CASES } from '../../data/mockCases.ts';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { MetricCard, Skeleton } from '../common/Primitives.tsx';
import { Badge } from '../common/Badge.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { useData } from '../../hooks/useData.ts';

interface CaseOverviewProps {
  caseData: Case;
  onTimeEntryAdded: (entry: TimeEntry) => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({ caseData, onTimeEntryAdded }) => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isLoading = useData(s => s.isLoading);
  
  const handleOpenModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      startTransition(() => {
          setter(true);
      });
  };

  const handleSaveTime = (rawEntry: any) => {
      const newEntry: TimeEntry = {
          id: `t-${crypto.randomUUID()}`,
          ...rawEntry
      };
      onTimeEntryAdded(newEntry);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      <TimeEntryModal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)} caseId={caseData.title} onSave={handleSaveTime} />
      
      {/* KPI Section - Auto-stacking Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <MetricCard label="Matter WIP" value="$124.5k" icon={DollarSign} trend="+12% budget" trendUp={true} className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow" isLoading={isLoading} />
        <MetricCard label="Hearings" value="3" icon={Clock} trend="Next in 2d" className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow" isLoading={isLoading} />
        <MetricCard label="Open Items" value="12" icon={Briefcase} trend="4 Critical" trendUp={false} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow" isLoading={isLoading} />
        <MetricCard label="Probability" value="68%" icon={TrendingUp} trend="Win Path" className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Case Info Card */}
        <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
                <div className="absolute top-4 right-4">
                     <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18}/>
                     </button>
                </div>
                
                {/* Left Side: Parties */}
                <div className="p-6 md:p-8 flex-1 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Badge variant="info" className="text-[10px]">PLAINTIFF</Badge>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">{caseData.client}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1"><ShieldCheck size={12}/> Represented by Firm</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full border border-slate-200">VS</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Badge variant="neutral" className="text-[10px]">DEFENDANT</Badge>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">{caseData.opposingCounsel || 'Unknown Party'}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Opposing Counsel: Morgan & Morgan</p>
                    </div>
                </div>

                {/* Right Side: Meta (Stacks on mobile) */}
                <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 md:p-8 md:w-72 flex flex-col justify-center space-y-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Number</p>
                        <p className="text-sm font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded w-fit">{caseData.id}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jurisdiction</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                             <MapPin size={14} className="text-slate-400"/>
                             {caseData.court || 'Pending'}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presiding</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                             <Gavel size={14} className="text-slate-400"/>
                             {caseData.judge || 'Unassigned'}
                        </div>
                     </div>
                </div>
            </div>

            {/* Matter Summary */}
            <Card title="Executive Abstract" className="shadow-sm">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : (
                    <p className="text-slate-600 text-sm leading-relaxed font-serif">
                        {caseData.description}
                    </p>
                )}
            </Card>
        </div>

        {/* Right Column: Actions & Status */}
        <div className="space-y-6">
            <Card title="Quick Actions" noPadding>
                <div className="divide-y divide-slate-100">
                    <button onClick={() => handleOpenModal(setShowTimeModal)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center group">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors"><Clock size={18}/></div>
                        <div className="flex-1">
                            <span className="text-sm font-bold text-slate-900 block">Log Billable Time</span>
                            <span className="text-[10px] text-slate-500">Track hours to this matter</span>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-blue-500"/>
                    </button>
                    <button onClick={() => handleOpenModal(setShowLinkModal)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center group">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mr-3 group-hover:bg-indigo-100 transition-colors"><Link size={18}/></div>
                        <div className="flex-1">
                            <span className="text-sm font-bold text-slate-900 block">Link Discovery</span>
                            <span className="text-[10px] text-slate-500">Connect external evidence</span>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                    </button>
                    <button onClick={() => handleOpenModal(setShowTransferModal)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center group">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mr-3 group-hover:bg-emerald-100 transition-colors"><ArrowRightLeft size={18}/></div>
                        <div className="flex-1">
                            <span className="text-sm font-bold text-slate-900 block">Transfer Matter</span>
                            <span className="text-[10px] text-slate-500">Reassign responsible attorney</span>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-emerald-500"/>
                    </button>
                </div>
            </Card>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center text-slate-400">
                       <Activity className="h-3 w-3 mr-2 text-blue-400"/> Operational Health
                    </h3>
                    <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-slate-300">Authorities</span>
                            <span className="font-bold font-mono text-blue-300">{caseData.citations?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-slate-300">Arguments</span>
                            <span className="font-bold font-mono text-purple-300">{caseData.arguments?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Defenses</span>
                            <span className="font-bold font-mono text-emerald-300">{caseData.defenses?.length || 0}</span>
                        </div>
                    </div>
                </div>
                
                <Button variant="outline" className="mt-6 w-full border-slate-700 hover:bg-white/5 text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider font-bold">
                    Generate Report
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
