
import React, { useState, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { ShieldAlert, CheckCircle, Scale, Plus } from 'lucide-react';
import { EvidenceItem } from '../../types.ts';
import { RuleSelector } from '../common/RuleSelector.tsx';
import { Modal } from '../common/Modal.tsx';

interface EvidenceAdmissibilityProps {
  selectedItem: EvidenceItem;
}

export const EvidenceAdmissibility: React.FC<EvidenceAdmissibilityProps> = ({ selectedItem }) => {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [rules, setRules] = useState<string[]>(selectedItem.linkedRules || ['FRE 401', 'FRE 901']);
  
  // Guideline 3: Transition for rule updates
  const [isPending, startTransition] = useTransition();

  const handleUpdateRules = (newRules: string[]) => {
      startTransition(() => {
          setRules(newRules);
      });
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {isRuleModalOpen && (
        <Modal isOpen={true} onClose={() => setIsRuleModalOpen(false)} title="Manage Applicable Rules">
            <div className="p-6 space-y-4">
                <RuleSelector selectedRules={rules} onRulesChange={handleUpdateRules} />
                <div className="flex justify-end">
                    <Button onClick={() => setIsRuleModalOpen(false)}>Done</Button>
                </div>
            </div>
        </Modal>
      )}

      <Card title="Admissibility Assessment">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
          <ShieldAlert className="h-5 w-5 text-amber-600 mr-3 mt-0.5 shrink-0"/>
          <div>
            <h5 className="text-sm font-bold text-amber-800">Current Status: {selectedItem.admissibility}</h5>
            <p className="text-xs text-amber-700 mt-1">
              {selectedItem.admissibility === 'Challenged' 
                ? 'Opposing counsel has filed a Motion in Limine based on FRE 901 (Authentication).' 
                : 'Standard foundation required. No current challenges.'}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-slate-900">Rules of Evidence Checklist</h4>
            <button onClick={() => setIsRuleModalOpen(true)} className="text-xs text-blue-600 hover:underline flex items-center">
                <Plus className="h-3 w-3 mr-1"/> Add Rule
            </button>
          </div>
          
          <div className="space-y-2">
            {rules.map(rule => (
                <div key={rule} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center mr-3">
                            <CheckCircle className="h-3 w-3 text-green-500"/>
                        </div>
                        <span className="text-sm font-medium">{rule}</span>
                    </div>
                    <Badge variant={rule.includes('901') ? 'warning' : 'success'}>
                        {rule.includes('901') ? 'Pending' : 'Pass'}
                    </Badge>
                </div>
            ))}
            {rules.length === 0 && <p className="text-xs text-slate-400 italic">No rules linked.</p>}
          </div>
        </div>
      </Card>

      <Card title="Motions & Challenges">
        <div className="text-center py-8 text-slate-400">
          <Scale className="h-12 w-12 mx-auto mb-3 opacity-20"/>
          <p>No active motions filed against this evidence ID.</p>
          <Button variant="outline" size="sm" className="mt-4">Log Anticipated Challenge</Button>
        </div>
      </Card>
    </div>
  );
};
