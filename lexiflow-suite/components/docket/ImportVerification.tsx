
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { 
  ShieldCheck, AlertTriangle, User, Gavel, 
  FileCheck, Clock, CheckCircle, ArrowRight 
} from 'lucide-react';

interface ImportVerificationProps {
  data: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportVerification: React.FC<ImportVerificationProps> = ({ data, onConfirm, onCancel }) => {
  const { classification, caseInfo, parties, deadlines } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Inference Summary [Step 20]</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Matter Classification</p>
             <div className="flex items-center gap-3">
                <Badge variant="purple" className="text-base py-1 px-3">{classification.practiceArea}</Badge>
                <div className="text-sm text-slate-300">NOS Code: <span className="font-mono text-blue-300">{caseInfo.natureOfSuit}</span></div>
             </div>
          </div>
          <div>
             <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Assigned Lead</p>
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">AH</div>
                <span className="text-sm font-bold">{classification.leadRole}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Conflict Engine Signals" noPadding>
          <div className="p-4 space-y-3">
             <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={16} className="text-green-600"/>
                   <span className="text-xs font-bold text-green-800 uppercase">Global Clearance</span>
                </div>
                <Badge variant="success">OK</Badge>
             </div>
             <p className="text-[10px] text-slate-500 italic px-1">
                No active or historical conflicts detected for {parties.length} identified parties across 48 jurisdictions.
             </p>
          </div>
        </Card>

        <Card title="Auto-Triggered Workflows" noPadding>
          <div className="divide-y divide-slate-100">
             {deadlines.map((dl: any) => (
                <div key={dl.id} className="p-3 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-3">
                      <Clock size={14} className="text-amber-500"/>
                      <span className="text-xs font-medium text-slate-700">{dl.title}</span>
                   </div>
                   <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{dl.date}</span>
                </div>
             ))}
          </div>
        </Card>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
        <AlertTriangle className="text-amber-600 h-5 w-5 shrink-0 mt-0.5"/>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Review Required:</strong> System has enqueued 12 document downloads for indexing. Historical jurisdictional analytics will be refreshed once background jobs [Step 21] complete.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Adjust Schema Mapping</Button>
        <Button 
          variant="primary" 
          icon={FileCheck} 
          onClick={onConfirm}
          className="bg-slate-900 border-none px-8 py-3 shadow-xl hover:bg-slate-800 rounded-full text-xs font-black uppercase tracking-[0.2em]"
        >
          Confirm Matter Commitment
        </Button>
      </div>
    </div>
  );
};
