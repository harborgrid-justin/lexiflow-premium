
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Input } from '../common/Inputs.tsx';
import { Badge } from '../common/Badge.tsx';
import { 
  Users, DollarSign, Globe, Shield, 
  UserCheck, Briefcase, Lock, Sparkles, 
  ArrowRight, Landmark
} from 'lucide-react';
import { ActivationConfig } from '../../services/matterActivationService.ts';

interface MatterConfigurationProps {
  onComplete: (config: ActivationConfig) => void;
  onBack: () => void;
}

export const MatterConfiguration: React.FC<MatterConfigurationProps> = ({ onComplete, onBack }) => {
  const [config, setConfig] = useState<ActivationConfig>({
    responsibleAttorney: 'Alexandra Hamilton',
    paralegal: 'Sarah Jenkins',
    billingCode: 'L100',
    budgetCap: 50000,
    isPortalVisible: true,
    autoRedact: true
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-20"><Briefcase size={120}/></div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-1">Final Governance Configuration</h3>
        <h2 className="text-xl font-black">Matter Activation Wizard [Step 23-32]</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Ownership & Staffing [Step 23]" noPadding>
          <div className="p-4 space-y-4">
             <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Responsible Attorney</label>
                <div className="relative">
                   <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                   <select 
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white outline-none focus:ring-2 focus:ring-blue-100"
                      value={config.responsibleAttorney}
                      onChange={e => setConfig({...config, responsibleAttorney: e.target.value})}
                   >
                      <option>Alexandra Hamilton</option>
                      <option>James Doe</option>
                   </select>
                </div>
             </div>
             <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Assign Paralegal</label>
                <div className="relative">
                   <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                   <select 
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white outline-none focus:ring-2 focus:ring-blue-100"
                      value={config.paralegal}
                      onChange={e => setConfig({...config, paralegal: e.target.value})}
                   >
                      <option>Sarah Jenkins</option>
                      <option>Support Pool A</option>
                   </select>
                </div>
             </div>
          </div>
        </Card>

        <Card title="Financial Controls [Step 31]" noPadding>
          <div className="p-4 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Billing Code</label>
                   <Input 
                      value={config.billingCode}
                      onChange={e => setConfig({...config, billingCode: e.target.value})}
                      className="font-mono text-xs"
                      placeholder="e.g. L100"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Budget Cap</label>
                   <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <Input 
                         type="number"
                         value={config.budgetCap}
                         onChange={e => setConfig({...config, budgetCap: parseInt(e.target.value)})}
                         className="pl-7"
                      />
                   </div>
                </div>
             </div>
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                <Landmark className="text-slate-400 h-5 w-5"/>
                <span className="text-[10px] text-slate-600 font-medium">Automatic LEDES-format time capture enabled for all assigned staff.</span>
             </div>
          </div>
        </Card>

        <Card title="Client Portal Visibility [Step 32]" noPadding className="md:col-span-2">
           <div className="p-5 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-2">
                    <Globe className="text-blue-600 h-5 w-5"/>
                    <h4 className="font-bold text-slate-800">Secure Extranet Access</h4>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    Determines whether the synthesized matter data (deadlines, non-privileged documents) is synchronized to the client-facing dashboard.
                 </p>
              </div>
              
              <div className="flex flex-col gap-3 shrink-0">
                 <label className="flex items-center justify-between gap-6 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-xs font-bold text-slate-700">Sync to Portal</span>
                    <input 
                       type="checkbox" 
                       className="w-5 h-5 rounded text-blue-600"
                       checked={config.isPortalVisible}
                       onChange={e => setConfig({...config, isPortalVisible: e.target.checked})}
                    />
                 </label>
                 <label className="flex items-center justify-between gap-6 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-purple-600"/>
                       <span className="text-xs font-bold text-slate-700">Auto-Redaction [Step 29]</span>
                    </div>
                    <input 
                       type="checkbox" 
                       className="w-5 h-5 rounded text-blue-600"
                       checked={config.autoRedact}
                       onChange={e => setConfig({...config, autoRedact: e.target.checked})}
                    />
                 </label>
              </div>
           </div>
        </Card>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onBack}>Review Matter Synthesis</Button>
        <Button 
          variant="primary" 
          icon={ArrowRight} 
          onClick={() => onComplete(config)}
          className="bg-slate-900 border-none px-10 py-3 shadow-xl hover:bg-slate-800 rounded-full text-xs font-black uppercase tracking-[0.2em]"
        >
          Activate & Launch Matter
        </Button>
      </div>
    </div>
  );
};
