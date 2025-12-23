/**
 * CreateCaseModal.tsx
 * 
 * @deprecated This modal component is deprecated as of 2025-12-22.
 * Use the full-page CreateCase component instead (navigate to PATHS.CREATE_CASE).
 * This file is kept for backward compatibility only.
 * 
 * MIGRATION GUIDE:
 * Instead of:
 *   <CreateCaseModal isOpen={true} onClose={...} onSave={...} />
 * 
 * Use navigation:
 *   setActiveView(PATHS.CREATE_CASE)
 *   // Component will call onBack() to return to case list
 * 
 * WHY DEPRECATED:
 * - Modal UX constrains form complexity and validation feedback
 * - Full-page allows better keyboard navigation and accessibility
 * - Dedicated route enables deep linking and browser history
 * - Type safety improved with explicit prop contracts
 * - Better separation of concerns (routing vs presentation)
 * 
 * Modal dialog for creating new cases with jurisdiction selection,
 * matter type configuration, and pre-filing vs filed case toggles.
 * 
 * @module components/case-list/CreateCaseModal
 * @category Case Management - Forms
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { CaseTypeToggle } from './case-form/CaseTypeToggle';
import { CaseFormFields } from './case-form/CaseFormFields';
import { JurisdictionSelector } from './case-form/JurisdictionSelector';

// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';
import { useNotify } from '../../../hooks/useNotify';

// Services
import { DataService } from '../../../services/data/dataService';
import { queryClient } from '../../../hooks/useQueryHooks';
import { queryKeys } from '../../../utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

// Utils
import { cn } from '../../../utils/cn';
import { getTodayString } from '../../../utils/dateUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case, CaseStatus, MatterType, JurisdictionObject, CaseId } from '../../../types';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSave }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();
  const notify = useNotify();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isPreFiling, setIsPreFiling] = useState(true);
  
  const [formData, setFormData] = useState<Partial<Case>>({
      title: '', client: '', matterType: 'Litigation', value: 0, description: ''
  });

  const [jurisdictionData, setJurisdictionData] = useState<{
      finalCourt: string;
      jurisdictionConfig: JurisdictionObject;
  } | null>(null);

  const isValid = formData.title && formData.client && (isPreFiling || formData.id) && jurisdictionData;

  const handleSave = async () => {
      if (!isValid) return;

      const newCase: Case = {
          id: (isPreFiling ? `MAT-${crypto.randomUUID().slice(0,8)}` : (formData.id || `CASE-${crypto.randomUUID().slice(0,8)}`)) as CaseId,
          title: formData.title || '',
          client: formData.client || '',
          matterType: formData.matterType as MatterType,
          status: isPreFiling ? CaseStatus.PreFiling : CaseStatus.Discovery,
          filingDate: isPreFiling ? '' : getTodayString(),
          description: formData.description || '',
          value: Number(formData.value),
          valuation: { amount: Number(formData.value) || 0, currency: 'USD', precision: 2 },
          jurisdiction: `${jurisdictionData.jurisdictionConfig.state} - ${jurisdictionData.jurisdictionConfig.courtLevel}`,
          jurisdictionConfig: jurisdictionData.jurisdictionConfig,
          court: jurisdictionData.finalCourt,
          judge: isPreFiling ? 'Unassigned' : formData.judge,
          opposingCounsel: 'Pending',
          parties: [], citations: [], arguments: [], defenses: [],
          isArchived: false
      };

      try {
          // Persist to backend via DataService
          await DataService.cases.add(newCase);
          
          // Invalidate cache to trigger refetch
          queryClient.invalidate(['cases']);
          
          // Notify parent component
          onSave(newCase);
          
          // Reset state for next open
          setFormData({ title: '', client: '', matterType: 'Litigation', value: 0, description: '' });
          setJurisdictionData(null);
          setIsPreFiling(true);
          onClose();
      } catch (error) {
          console.error('Failed to create case:', error);
          notify.error('Failed to create case. Please check your input and try again.');
      }
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

