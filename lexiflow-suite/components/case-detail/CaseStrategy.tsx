
import React, { useState, useTransition } from 'react';
import { Citation, LegalArgument, Defense, EvidenceItem } from '../../types.ts';
import { BookOpen, Target, Shield, Plus, ExternalLink, Scale, AlertTriangle, CheckCircle, X, Box, Gavel } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input, TextArea } from '../common/Inputs.tsx';
import { RiskMeter } from '../common/RiskMeter.tsx';

interface CaseStrategyProps {
  citations?: Citation[];
  arguments?: LegalArgument[];
  defenses?: Defense[];
  evidence?: EvidenceItem[];
}

export const CaseStrategy: React.FC<CaseStrategyProps> = ({ 
  citations: initialCitations = [], 
  arguments: initialArgs = [], 
  defenses: initialDefenses = [],
  evidence = []
}) => {
  const [citations, setCitations] = useState(initialCitations);
  const [args, setArgs] = useState(initialArgs);
  const [defenses, setDefenses] = useState(initialDefenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Citation' | 'Argument' | 'Defense'>('Citation');
  const [newItem, setNewItem] = useState<any>(null);
  
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const id = `${Date.now()}`;
    startTransition(() => {
        if (modalType === 'Citation') {
            setCitations([...citations, { ...newItem, id, relevance: 'Medium' }]);
        } else if (modalType === 'Argument') {
            setArgs([...args, { ...newItem, id, strength: 50, status: 'Draft', relatedCitationIds: [], relatedEvidenceIds: [] }]);
        } else {
            setDefenses([...defenses, { ...newItem, id, status: 'Asserted' }]);
        }
        setIsModalOpen(false);
        setNewItem({});
    });
  };

  return (
    <div className={`space-y-6 animate-fade-in transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1"><BookOpen className="h-6 w-6 text-blue-600"/> Legal Strategy</h3>
          <p className="text-sm text-slate-500 font-medium">Case law authority, affirmative arguments, and defensive posture.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={() => { setModalType('Citation'); setIsModalOpen(true); }} icon={Plus} className="flex-1 md:flex-none">Citation</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Argument'); setIsModalOpen(true); }} icon={Plus} className="flex-1 md:flex-none">Argument</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Defense'); setIsModalOpen(true); }} icon={Plus} className="flex-1 md:flex-none">Defense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ARGUMENTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 px-1">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2"><Target className="h-4 w-4 text-blue-600"/> Arguments</h4>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{args.length}</span>
          </div>
          {args.map(arg => (
            <div key={arg.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-all cursor-pointer group relative">
              <div className="flex justify-between items-start mb-2">
                 <h5 className="font-bold text-slate-900 text-sm leading-snug pr-8">{arg.title}</h5>
                 <Badge variant={arg.status === 'Active' ? 'success' : 'neutral'} className="shrink-0 text-[9px] py-0.5">{arg.status}</Badge>
              </div>
              <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">{arg.description}</p>
              <RiskMeter value={arg.strength} label="Strength" type="strength" />
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[10px] font-bold text-slate-400 gap-4">
                 <span className="flex items-center group-hover:text-blue-600 transition-colors"><Gavel className="h-3 w-3 mr-1.5"/> {arg.relatedCitationIds?.length || 0} Auth</span>
                 <span className="flex items-center group-hover:text-blue-600 transition-colors"><Box className="h-3 w-3 mr-1.5"/> {arg.relatedEvidenceIds?.length || 0} Evid</span>
              </div>
            </div>
          ))}
        </div>

        {/* DEFENSES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 px-1">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2"><Shield className="h-4 w-4 text-amber-600"/> Defenses</h4>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{defenses.length}</span>
          </div>
          {defenses.map(def => (
            <div key={def.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-all cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-slate-900 text-sm">{def.title}</h5>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{def.type}</span>
               </div>
               <p className="text-xs text-slate-600 mb-3 leading-relaxed">{def.description}</p>
               <div className="flex justify-end">
                   <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                        def.status === 'Asserted' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                    }`}>
                        {def.status}
                    </span>
               </div>
            </div>
          ))}
        </div>

        {/* CITATIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 px-1">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2"><Scale className="h-4 w-4 text-purple-600"/> Authorities</h4>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">{citations.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
             {citations.map((cit) => (
                 <div key={cit.id} className="p-4 hover:bg-slate-50 transition-colors group">
                     <div className="flex justify-between items-start mb-1.5">
                         <div className="flex items-center gap-2">
                             {cit.shepardsSignal === 'Positive' && <CheckCircle className="h-3.5 w-3.5 text-green-500 fill-green-50"/>}
                             {cit.shepardsSignal === 'Caution' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 fill-amber-50"/>}
                             {cit.shepardsSignal === 'Negative' && <X className="h-3.5 w-3.5 text-red-500 fill-red-50"/>}
                             <span className="font-serif text-sm text-blue-700 font-bold hover:underline cursor-pointer italic">{cit.citation}</span>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <ExternalLink className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600 cursor-pointer"/>
                         </div>
                     </div>
                     <p className="text-xs font-bold text-slate-800 mb-1">{cit.title}</p>
                     <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/50 p-1.5 rounded">{cit.description}</p>
                 </div>
             ))}
             {citations.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic font-medium">No citations recorded.</div>}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        <div className="p-6 space-y-4">
            <Input label="Title / Citation" value={newItem?.title || ''} onChange={e => setNewItem({...newItem, title: e.target.value, citation: e.target.value})} />
            <TextArea label="Description" rows={3} value={newItem?.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} />
            <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                <Button variant="secondary" className="mr-2" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save Record</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
