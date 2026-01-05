
import React, { useState, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { 
  Gavel, CheckCircle, ShieldAlert, Archive, BarChart, 
  MessageSquare, Brain, Lock, ArrowRight, RefreshCw, Clock
} from 'lucide-react';
import { Case, CaseOutcome } from '../../types.ts';
import { DispositionService } from '../../services/dispositionService.ts';

interface CaseClosureProps {
  caseData: Case;
  onComplete: () => void;
}

export const CaseClosure: React.FC<CaseClosureProps> = ({ caseData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [outcome, setOutcome] = useState<CaseOutcome>('Settled');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFinalize = async () => {
    setIsProcessing(true);
    await DispositionService.finalizeDisposition(caseData.id, outcome);
    await DispositionService.feedModelUpdate(caseData.id, outcome);
    
    startTransition(() => {
        setIsProcessing(false);
        setStep(3);
    });
  };

  return (
    <div className="relative space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-5 transform scale-150 pointer-events-none"><Archive size={200}/></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded border border-blue-500 shadow-sm uppercase tracking-widest">Step {step}/3</span>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Matter Disposition</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Case Finalization Protocol</h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base font-medium leading-relaxed">
                Initiating the immutable archival sequence. This process locks all case documents, reconciles financials, and indexes outcomes for firm intelligence.
            </p>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <Card title="Outcome Classification" noPadding className="h-full">
                <div className="p-6 space-y-6">
                    <p className="text-sm text-slate-500 font-medium">Select the primary disposition outcome for statistical indexing and precedent tracking.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {['Win', 'Loss', 'Settled', 'Dismissed'].map(o => (
                            <button 
                                key={o}
                                onClick={() => setOutcome(o as CaseOutcome)}
                                className={`py-4 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center ${outcome === o ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card title="Pre-Flight Checks" noPadding className="h-full">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full text-green-600 shadow-sm"><Clock size={16}/></div>
                            <span className="text-sm font-bold text-green-900">Deadlines Cleared</span>
                        </div>
                        <CheckCircle size={20} className="text-green-600 fill-green-100"/>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full text-amber-600 shadow-sm"><Gavel size={16}/></div>
                            <span className="text-sm font-bold text-amber-900">Trust Ledger Status</span>
                        </div>
                        <Badge variant="warning" className="bg-white border-amber-200 text-amber-700 text-xs font-bold">-$240.00 WIP</Badge>
                    </div>
                </div>
            </Card>

            <div className="md:col-span-2 flex justify-end pt-4">
                <Button variant="primary" icon={ArrowRight} onClick={() => setStep(2)} className="bg-slate-900 rounded-full px-10 py-4 shadow-xl hover:shadow-2xl hover:bg-slate-800 text-xs font-black uppercase tracking-widest">
                    Continue to Archival
                </Button>
            </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <Card title="Knowledge Capture & Governance">
                <div className="space-y-8">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Brain size={14}/> Key Lessons & Strategy Annotations
                        </label>
                        <textarea className="w-full bg-white border border-slate-200 rounded-xl p-5 text-sm min-h-[160px] outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all font-medium text-slate-700 leading-relaxed" placeholder="Capture strategic insights, judge tendencies, and key victories for future reference..."></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-5 hover:border-purple-300 transition-colors bg-white shadow-sm">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Brain size={24}/></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">ML Model Sync</p>
                                <p className="text-xs text-slate-500 mt-1">Train outcome prediction engine with result.</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"/>
                        </div>
                        <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-5 hover:border-blue-300 transition-colors bg-white shadow-sm">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Lock size={24}/></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">7-Year Retention</p>
                                <p className="text-xs text-slate-500 mt-1">Scheduled destruction: <span className="font-mono font-bold">2031</span></p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"/>
                        </div>
                    </div>
                </div>
             </Card>
             <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <Button variant="secondary" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-wide px-6">Back</Button>
                <Button variant="primary" icon={isProcessing ? RefreshCw : Archive} onClick={handleFinalize} isLoading={isProcessing} className="bg-emerald-600 border-none px-12 py-4 rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl text-xs font-black uppercase tracking-widest">
                    Finalize & Archive
                </Button>
             </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-in zoom-in-95 shadow-sm">
             <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
                <CheckCircle size={48} className="stroke-[3]"/>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Matter Concluded</h2>
             <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                Documents are now <span className="text-slate-900 font-bold bg-slate-100 px-1 rounded">READ-ONLY</span>. Retention policies applied. Outcome indexed in Brief Bank.
             </p>
             <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 px-8">
                <Button variant="outline" icon={BarChart} className="py-4 px-8 rounded-full border-slate-300 text-slate-600 font-bold uppercase tracking-wide text-xs hover:bg-slate-50">View Report</Button>
                <Button variant="primary" onClick={onComplete} className="bg-slate-900 py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:bg-slate-800 font-black uppercase tracking-widest text-xs">Return to Dashboard</Button>
             </div>
        </div>
      )}
    </div>
  );
};
