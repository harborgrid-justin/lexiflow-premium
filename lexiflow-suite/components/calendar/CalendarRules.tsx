
import React, { useState } from 'react';
import { Settings, Book, Check, Plus, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';

export const CalendarRules: React.FC = () => {
  const [rules, setRules] = useState([
    'Federal Rules of Civil Procedure (FRCP)', 
    'California Code of Civil Procedure', 
    'Los Angeles Superior Court Local Rules', 
    'NY Supreme Court Commercial Division'
  ]);
  const [automation, setAutomation] = useState([
      { id: 1, title: 'Trial Date Set', desc: 'Auto-calculate discovery cutoff (30 days prior) and expert disclosure (50 days prior).', enabled: true },
      { id: 2, title: 'Motion Filed', desc: 'Auto-schedule Opposition Due (14 days before hearing) and Reply Due (5 days before).', enabled: true },
      { id: 3, title: 'Deposition Scheduled', desc: 'Remind court reporter 24h prior.', enabled: true }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState('');

  const addRule = () => {
      if(newRule) {
          setRules([...rules, newRule]);
          setNewRule('');
          setIsModalOpen(false);
      }
  };

  const removeRule = (idx: number) => {
      setRules(rules.filter((_, i) => i !== idx));
  };

  const toggleAutomation = (id: number) => {
      setAutomation(automation.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative group/container h-full">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center"><Book className="h-5 w-5 mr-2 text-blue-600"/> Active Rule Sets</span>
            <Button size="sm" variant="ghost" icon={Plus} onClick={() => setIsModalOpen(true)}>Add</Button>
        </h3>
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 group">
              <span className="text-sm font-medium text-slate-700">{rule}</span>
              <div className="flex gap-2">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white"/>
                </div>
                <button onClick={() => removeRule(i)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {rules.length === 0 && <p className="text-sm text-slate-400 italic">No active rule sets.</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Settings className="h-5 w-5 mr-2 text-slate-600"/> Automation Triggers</h3>
        <div className="space-y-4">
            {automation.map(auto => (
                <div key={auto.id} className="flex items-start gap-3">
                    <button onClick={() => toggleAutomation(auto.id)} className={`mt-1 transition-colors ${auto.enabled ? 'text-blue-600' : 'text-slate-300'}`}>
                        {auto.enabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                    </button>
                    <div>
                    <p className={`text-sm font-bold ${auto.enabled ? 'text-slate-800' : 'text-slate-400'}`}>{auto.title}</p>
                    <p className="text-xs text-slate-500">{auto.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Jurisdiction / Rule Set">
          <div className="p-6 space-y-4">
              <Input label="Rule Set Name" placeholder="e.g. Texas District Court Local Rules" value={newRule} onChange={e => setNewRule(e.target.value)} autoFocus/>
              <p className="text-xs text-slate-500">Adding a rule set will automatically import relevant statutory deadlines into the calculator engine.</p>
              <div className="flex justify-end pt-2">
                  <Button onClick={addRule}>Activate Rule Set</Button>
              </div>
          </div>
      </Modal>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-06
      </div>
    </div>
  );
};
