
import React, { useState, useTransition } from 'react';
import { X, FileText, ChevronRight, Save, Sparkles, FileCheck, RefreshCw } from 'lucide-react';
import { GeminiService } from '../services/geminiService.ts';
import { LegalDocument } from '../types.ts';
import { Stepper } from './common/Stepper.tsx';
import { Button } from './common/Button.tsx';
import { Badge } from './common/Badge.tsx';

interface DocumentAssemblyProps {
  onClose: () => void;
  caseTitle: string;
  onSave?: (doc: LegalDocument) => void;
}

export const DocumentAssembly: React.FC<DocumentAssemblyProps> = ({ onClose, caseTitle, onSave }) => {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('');
  const [formData, setFormData] = useState({ recipient: '', date: '', mainPoint: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isPending, startTransition] = useTransition();

  const generate = async () => {
    setLoading(true);
    const context = `Template: ${template}. Case: ${caseTitle}. Recipient: ${formData.recipient}. Point: ${formData.mainPoint}.`;
    const text = await GeminiService.generateDraft(context, 'Pleading/Agreement');
    
    startTransition(() => {
        setResult(text);
        setLoading(false);
        setStep(3);
    });
  };

  const handleSave = () => {
    if (onSave && result) {
      startTransition(() => {
        const newDoc: LegalDocument = {
            id: `GEN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
            caseId: 'current',
            title: `${template} - ${new Date().toLocaleDateString()}`,
            type: 'Generated',
            content: result,
            uploadDate: new Date().toLocaleDateString(),
            lastModified: new Date().toLocaleDateString(),
            tags: ['AI Generated', template, 'Draft'],
            versions: [],
            status: 'Draft'
        };
        onSave(newDoc);
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center backdrop-blur-md p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-opacity duration-200 border border-slate-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        {/* LO-16 / DS Header Implementation */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white ring-4 ring-indigo-50">
                <Sparkles size={24} fill="currentColor"/>
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Instrument Assembly</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Neural Synthesis Engine v3.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors border border-transparent hover:border-slate-300 shadow-sm"><X size={20} /></button>
        </div>

        <div className="px-12 py-8 bg-white border-b border-slate-50">
            <Stepper 
                steps={['Select Template', 'Model Context', 'Validate Draft']} 
                currentStep={step} 
                onStepClick={(s) => s < step && setStep(s)}
            />
        </div>

        <div className="p-10 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Pleading & Contract Library</h4>
                <Badge variant="neutral" className="font-mono text-[10px]">245 TEMPLATES</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Mutual NDA', 'Engagement Letter', 'Motion to Dismiss', 'Settlement & Release', 'Notice of Appearance', 'Production Request Set'].map(t => (
                    <button 
                        key={t} 
                        onClick={() => { setTemplate(t); setStep(2); }} 
                        className="group text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 active:scale-[0.98]"
                    >
                        <div className="flex justify-between items-center">
                            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white transition-colors border border-slate-100 group-hover:border-indigo-200 shadow-inner group-hover:shadow-sm">
                                <FileText size={20} className="text-slate-400 group-hover:text-indigo-600"/>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"/>
                        </div>
                        <span className="font-black text-sm text-slate-800 group-hover:text-indigo-900 tracking-tight leading-snug">{t}</span>
                    </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-400 max-w-xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <div className="flex flex-col">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuration Target</h4>
                    <span className="text-lg font-black text-indigo-700 tracking-tight">{template}</span>
                 </div>
                 <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border transition-all">Change Template</button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Primary Recipient / Entity</label>
                    <input 
                        placeholder="Legal name of opposing party or entity..." 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-300" 
                        value={formData.recipient} 
                        onChange={e => setFormData({...formData, recipient: e.target.value})} 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Key Legal Logic (Natural Language)</label>
                    <textarea 
                        placeholder="Describe specific terms, dates, or custom conditions..." 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-inner min-h-[150px] leading-relaxed placeholder:text-slate-300" 
                        value={formData.mainPoint} 
                        onChange={e => setFormData({...formData, mainPoint: e.target.value})} 
                    />
                </div>
              </div>
              
              <button 
                onClick={generate} 
                disabled={loading || !formData.recipient || !formData.mainPoint} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] flex justify-center items-center gap-4 group"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 fill-current group-hover:scale-125 transition-transform"/>}
                {loading ? 'Processing Neural Model...' : 'Synthesize Instrument'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileCheck size={16} className="text-green-600"/> Synthesis Output
                 </h4>
                 <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest border px-3 py-1 rounded-full">Refine Context</button>
              </div>
              
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-inner relative group min-h-[350px]">
                <textarea 
                    className="w-full h-full bg-transparent border-none outline-none font-serif text-slate-800 text-base leading-loose resize-none" 
                    value={result} 
                    onChange={(e) => setResult(e.target.value)}
                    spellCheck={false}
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="info" className="bg-white border-blue-100 shadow-sm font-bold text-[9px]">EDITABLE BUFFER</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setStep(2)} className="py-4 font-bold uppercase tracking-widest text-xs rounded-xl">Back</Button>
                  <Button variant="primary" icon={Save} onClick={handleSave} className="py-4 bg-slate-900 border-none shadow-2xl shadow-slate-300 font-black uppercase tracking-[0.2em] text-xs rounded-xl">Commit to Case File</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
