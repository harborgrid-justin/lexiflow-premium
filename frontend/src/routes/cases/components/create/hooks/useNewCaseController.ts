import { useState, useCallback } from 'react';

import { PATHS } from '@/config/paths.config'; // Added
import { useNotify } from '@/hooks/useNotify';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { type Matter, type Case, type User } from '@/types';
import { queryKeys } from '@/utils/queryKeys';

import { type TabId } from '../types/newCaseTypes';

import { useConflictCheck } from './useConflictCheck';
import { useFormValidation } from './useFormValidation';
import { useNewCaseForm } from './useNewCaseForm';
import { useNewCaseMutations } from './useNewCaseMutations';
import { useRelatedCases } from './useRelatedCases';

import type { RelatedCase } from './useRelatedCases';


interface UseNewCaseControllerProps {
  id?: string;
  onBack?: () => void;
  onSaved?: () => void;
  currentUser?: User | null;
}

export const useNewCaseController = ({
  id,
  onBack,
  onSaved,
  currentUser
}: UseNewCaseControllerProps) => {
  const notify = useNotify();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState<TabId>('intake');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Data Fetching
  const { data: existingMatters = [] } = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.cases.getAll(),
    { staleTime: 60000 }
  );

  // Form Management
  const { formData, setFormData, handleChange, loadFormData, generatedNumber } = useNewCaseForm(
    existingMatters.length
  );

  // Conflict Checking
  const { conflictStatus } = useConflictCheck(formData.clientName, existingMatters, id);

  // Form Validation
  const { errors, validate, clearFieldError } = useFormValidation(formData, conflictStatus);

  // Related Cases
  const { addRelatedCase, removeRelatedCase, updateRelatedCase } = useRelatedCases(
    formData.relatedCases,
    (cases: RelatedCase[]) => setFormData(prev => ({ ...prev, relatedCases: cases }))
  );

  // Mutations
  const { createMatter, updateMatter, deleteMatter, isDeleting } = useNewCaseMutations(
    id,
    onSaved,
    onBack
  );

  // Load existing data
  const { isLoading } = useQuery<Matter | Case | null>(
    id ? queryKeys.cases.matters.detail(id) : ['no-matter'],
    () => (id ? DataService.cases.getById(id) : Promise.resolve(null)),
    {
      staleTime: 30000,
      enabled: !!id,
      onSuccess: (data: Matter | Case | null) => {
        if (data) loadFormData(data);
      }
    }
  );

  const handleFieldChange = useCallback((field: keyof typeof formData, value: unknown) => {
    handleChange(field, value);
    if (errors[field]) {
      clearFieldError(field);
    }
  }, [handleChange, errors, clearFieldError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify.error('Please fix validation errors');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        matterNumber: generatedNumber,
        caseNumber: generatedNumber,
        id: id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser?.id || 'current-user',
      } as Matter & Case;

      if (isEditMode && id) {
        await updateMatter(id, dataToSave);
      } else {
        await createMatter(dataToSave as Matter);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await deleteMatter(id);
    setShowDeleteConfirm(false);
  }, [id, deleteMatter]);

  const handleCancel = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = `#/${PATHS.MATTERS}`;
    }
  }, [onBack]);

  return {
    isEditMode,
    activeTab,
    setActiveTab,
    saving,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isLoading,
    formData,
    conflictStatus,
    errors,
    handleFieldChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    addRelatedCase,
    removeRelatedCase,
    updateRelatedCase,
    isDeleting,
    generatedNumber
  };
};
