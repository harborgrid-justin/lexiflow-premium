
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Case, CaseStatus, MatterType, JurisdictionObject, CaseId } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { CaseTypeToggle } from './case-form/CaseTypeToggle';
import { CaseFormFields } from './case-form/CaseFormFields';
import { JurisdictionSelector } from './jurisdiction/JurisdictionSelector';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  
  const [isPreFiling, setIsPreFiling] = useState(true);
  
  const [formData, setFormData] = useState<Partial<Case>>({
      title: '', client: '', matterType: 'Litigation', value: 0, description: ''
  });

  const [jurisdictionData, setJurisdictionData] = useState<{
      finalCourt: string;
      jurisdictionConfig: JurisdictionObject;
  } | null>(null);

  const isValid = formData.title && formData.client && (isPreFiling || formData.id) && jurisdictionData;

  const handleSave = () => {
      if (!isValid) return;

      const newCase: Case = {
          id: (isPreFiling ? `MAT-${crypto.randomUUID().slice(0,8)}` : (formData.id || `CASE-${crypto.randomUUID().slice(0,8)}`)) as CaseId,
          title: formData.title || '',
          client: formData.client || '',
          matterType: formData.matterType as MatterType,
          status: isPreFiling ? CaseStatus.PreFiling : CaseStatus.Discovery,
          filingDate: isPreFiling ? '' : new Date().toISOString().split('T')[0],
          description: formData.description || '',
          value: Number(formData.value),
          valuation: { amount: Number(formData.value) || 0, currency: 'USD', precision: 2 },
          jurisdiction: `${jurisdictionData.jurisdictionConfig.state} - ${jurisdictionData.jurisdictionConfig.courtLevel}`,
          jurisdictionConfig: jurisdictionData.jurisdictionConfig,
          court: jurisdictionData.finalCourt,
          judge: isPreFiling ? 'Unassigned' : formData.judge,
          opposingCounsel: 'Pending',
          parties: [], citations: [], arguments: [], defenses: []
      };

      onSave(newCase);
      // Reset state for next open
      setFormData({ title: '', client: '', matterType: 'Litigation', value: 0, description: '' });
      setJurisdictionData(null);
      setIsPreFiling(true);
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isPreFiling ? "Develop New Matter" : "File New Case"} size="lg" closeOnBackdrop={false}>
      <div className="p-6 space-y-6">
        <CaseTypeToggle isPreFiling={isPreFiling} setIsPreFiling={setIsPreFiling} />

        <div className="grid grid-cols-2 gap-6">
          <CaseFormFields 
            formData={formData} 
            setFormData={setFormData}
            isPreFiling={isPreFiling}
          />
          <JurisdictionSelector onJurisdictionChange={setJurisdictionData} />
        </div>

        <div className={cn("flex justify-end gap-3 pt-4 border-t", theme.border.default)}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!isValid}>
                {isPreFiling ? 'Create Matter' : 'File Case'}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
