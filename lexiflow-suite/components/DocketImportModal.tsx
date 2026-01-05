
import React, { useState } from 'react';
import { Modal } from './common/Modal.tsx';
import { Button } from './common/Button.tsx';
import { GeminiService } from '../services/geminiService.ts';
import { PacerImportService, ProcessingEvent } from '../services/pacerImportService.ts';
import { MatterActivationService, ActivationConfig } from '../services/matterActivationService.ts';
import { ArrowRight, FileCode, Sparkles, CheckCircle, ShieldCheck, Terminal, Cpu, Loader2 } from 'lucide-react';
import { ParsedDocketPreview } from './docket/ParsedDocketPreview.tsx';
import { ImportVerification } from './docket/ImportVerification.tsx';
import { MatterConfiguration } from './docket/MatterConfiguration.tsx';
import { Stepper } from './common/Stepper.tsx';
import { useNotify } from '../hooks/useNotify.ts';

interface DocketImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export const DocketImportModal: React.FC<DocketImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'text' | 'xml'>('xml');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineEvents, setPipelineEvents] = useState<ProcessingEvent[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isImportComplete, setIsImportComplete] = useState(false);
  const notify = useNotify();

  const handleBeginIngestion = async () => {
    if (!rawText.trim()) return;
    
    if (mode === 'text') {
      setIsProcessing(true);
      try {
        const result = await GeminiService.parseDocket(rawText);
        setParsedData(result);
        setStep(2);
      } catch (e) {
        notify.error("AI Synthesis failed.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    setStep(3); 
    
    await PacerImportService.processIngestion(
      rawText,
      (events) => setPipelineEvents(events),
      (result) => {
        setParsedData(result);
        setIsProcessing(false);
        setStep(4); 
      }
    );
  };

  const handleConfigurationComplete = async (config: ActivationConfig) => {
    setIsProcessing(true);
    try {
        await MatterActivationService.activateMatter(parsedData.caseInfo.id, config);
        setIsImportComplete(true);
        onImport(parsedData);
        
        setTimeout(() => {
            onClose();
            setTimeout(() => {
                setStep(1);
                setRawText('');
                setParsedData(null);
                setIsImportComplete(false);
                setPipelineEvents([]);
            }, 500);
        }, 4000);
    } catch (e) {
        notify.error("Matter activation failed.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Docket Ingestion Engine" size="lg">
      <div className="p-6 min-h-[520px] flex flex-col">
        {!isImportComplete ? (
          <>
            <Stepper 
                steps={['Source', 'Process', 'Verify', 'Configure']} 
                currentStep={step > 2 ? (step === 3 ? 2 : step === 4 ? 3 : 4) : step} 
            />
            
            <div className="mt-6 flex-1 flex flex-col">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in flex-1">
                  <div className="flex gap-6 border-b border-slate-200 pb-1 mb-4">
                      <button onClick={() => setMode('xml')} className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all border-b-2 ${mode === 'xml' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><FileCode className="h-3.5 w-3.5"/> PACER XML Bulk</button>
                      <button onClick={() => setMode('text')} className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all border-b-2 ${mode === 'text' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><Sparkles className="h-3.5 w-3.5"/> AI Neural Parse</button>
                  </div>
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">Standardized ECF export ingestion [Step 8-22].</p>
                  <textarea className="flex-1 w-full p-4 border border-slate-300 rounded-xl font-mono text-[11px] bg-white focus:ring-4 focus:ring-blue-50 outline-none shadow-inner min-h-[250px]" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste XML payload..."/>
                  <div className="flex justify-end pt-4"><Button onClick={handleBeginIngestion} disabled={isProcessing || !rawText.trim()} icon={isProcessing ? undefined : ArrowRight} isLoading={isProcessing} className="bg-slate-900 px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em]">Analyze Source</Button></div>
                </div>
              )}

              {step === 3 && (
                <div className="flex-1 flex flex-col space-y-4 animate-fade-in">
                  <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs text-slate-300 shadow-2xl h-[350px] flex flex-col overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2 shrink-0">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500"></div>
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         <span className="ml-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Ingestion Pipeline</span>
                      </div>
                      <Cpu size={14} className="text-blue-500 animate-pulse"/>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {pipelineEvents.map((evt) => (
                        <div key={evt.step} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2">
                          <span className={`w-8 shrink-0 text-right ${evt.status === 'active' ? 'text-blue-400 font-bold' : evt.status === 'success' ? 'text-green-500' : 'text-slate-600'}`}>[{evt.step}]</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                               <span className={evt.status === 'active' ? 'text-white' : evt.status === 'success' ? 'text-slate-300' : 'text-slate-500'}>{evt.label}...</span>
                               {evt.status === 'active' && <Loader2 size={10} className="animate-spin text-blue-400"/>}
                               {evt.status === 'success' && <CheckCircle size={10} className="text-green-500"/>}
                            </div>
                            {evt.detail && <p className="text-[10px] text-slate-500 mt-0.5 ml-1 border-l border-slate-700 pl-2">↳ {evt.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && parsedData && (
                 <ImportVerification data={parsedData} onConfirm={() => setStep(5)} onCancel={() => setStep(1)}/>
              )}

              {step === 5 && (
                  <MatterConfiguration onComplete={handleConfigurationComplete} onBack={() => setStep(4)} />
              )}

              {step === 2 && parsedData && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                  <ParsedDocketPreview parsedData={parsedData} setStep={setStep} handleFinish={() => setStep(5)} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
             <div className="relative">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-50 z-10 relative">
                    <CheckCircle size={56} className="stroke-[3]"/>
                </div>
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Matter Activated</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">Ownership assigned, financial ledger opened, and client portal sync [Step 32] is live.</p>
             </div>
             <div className="flex flex-col items-center gap-4 w-full px-12">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm"><ShieldCheck size={16}/> Governance Enforced</div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner"><div className="h-full bg-emerald-500 animate-[progress_4s_linear]"></div></div>
                <span className="text-[10px] font-mono text-slate-400">Scheduling automatic PACER polling [Step 33]...</span>
             </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
