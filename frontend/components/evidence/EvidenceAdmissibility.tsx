
/**
 * @module EvidenceAdmissibility
 * @category Evidence
 * @description Component for managing and viewing the admissibility status of evidence items.
 * Allows linking Federal Rules of Evidence (FRE) and tracking challenges.
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Scale, Plus } from 'lucide-react';

// Common Components
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RuleSelector } from '../common/RuleSelector';
import { Modal } from '../common/Modal';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

// Types
import { EvidenceItem } from '../../types';

interface EvidenceAdmissibilityProps {
  selectedItem: EvidenceItem;
}

export const EvidenceAdmissibility: React.FC<EvidenceAdmissibilityProps> = ({ selectedItem }) => {
  const { theme } = useTheme();
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  // Local state for demonstration since we can't easily bubble up state in this architecture without context
  const [rules, setRules] = useState<string[]>(selectedItem.linkedRules || ['FRE 401', 'FRE 901']);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {isRuleModalOpen && (
        <Modal isOpen={true} onClose={() => setIsRuleModalOpen(false)} title="Manage Applicable Rules">
            <div className="p-6 space-y-4">
                <RuleSelector selectedRules={rules} onRulesChange={setRules} />
                <div className={cn("flex justify-end pt-4 border-t mt-4", theme.border.default)}>
                    <Button onClick={() => setIsRuleModalOpen(false)}>Done</Button>
                </div>
            </div>
        </Modal>
      )}

      <Card title="Admissibility Assessment">
        <div className={cn("border rounded-lg p-4 mb-6 flex items-start", theme.status.warning.bg, theme.status.warning.border)}>
          <ShieldAlert className={cn("h-5 w-5 mr-3 mt-0.5 shrink-0", theme.status.warning.text)}/>
          <div>
            <h5 className={cn("text-sm font-bold", theme.status.warning.text)}>Current Status: {selectedItem.admissibility}</h5>
            <p className={cn("text-xs mt-1", theme.status.warning.text)}>
              {selectedItem.admissibility === 'Challenged' 
                ? 'Opposing counsel has filed a Motion in Limine based on FRE 901 (Authentication).' 
                : 'Standard foundation required. No current challenges.'}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className={cn("font-bold text-sm", theme.text.primary)}>Rules of Evidence Checklist</h4>
            <button 
                onClick={() => setIsRuleModalOpen(true)} 
                className={cn("text-xs hover:underline flex items-center", theme.primary.text)}
            >
                <Plus className="h-3 w-3 mr-1"/> Add Rule
            </button>
          </div>
          
          <div className="space-y-2">
            {rules.map(rule => (
                <div key={rule} className={cn("flex items-center justify-between p-3 border rounded", theme.surface.highlight, theme.border.default)}>
                    <div className="flex items-center">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3", theme.status.success.border)}>
                            <CheckCircle className={cn("h-3 w-3", theme.status.success.text)}/>
                        </div>
                        <span className={cn("text-sm font-medium", theme.text.primary)}>{rule}</span>
                    </div>
                    <Badge variant={rule.includes('901') ? 'warning' : 'success'}>
                        {rule.includes('901') ? 'Pending' : 'Pass'}
                    </Badge>
                </div>
            ))}
            {rules.length === 0 && <p className={cn("text-xs italic", theme.text.tertiary)}>No rules linked.</p>}
          </div>
        </div>
      </Card>

      <Card title="Motions & Challenges">
        <div className={cn("text-center py-8", theme.text.tertiary)}>
          <Scale className="h-12 w-12 mx-auto mb-3 opacity-20"/>
          <p>No active motions filed against this evidence ID.</p>
          <Button variant="outline" size="sm" className="mt-4">Log Anticipated Challenge</Button>
        </div>
      </Card>
    </div>
  );
};
