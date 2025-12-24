import React, { useState, useCallback } from 'react';
import { Save, X } from 'lucide-react';
import type { UserId, Matter } from '../../../../types';
import { MatterType, MatterStatus, MatterPriority, PracticeArea } from '../../../../types';
import { BasicInfoSection } from './BasicInfoSection';
import { ClientSection, AttorneySection, DatesSection, BillingSection } from './FormSections';
import { useFormValidation } from './useFormValidation';
import type { MatterFormProps, MatterFormData } from './types';

type LegacyMatter = {
  type?: string;
  responsibleAttorneyId?: UserId;
  responsibleAttorneyName?: string;
  billingArrangement?: string;
};

export const MatterForm: React.FC<MatterFormProps> = ({ matter, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MatterFormData>({
    matterNumber: matter?.matterNumber || '',
    title: matter?.title || '',
    description: matter?.description || '',
    matterType: matter?.matterType || (matter as LegacyMatter)?.type || MatterType.LITIGATION,
    status: matter?.status || MatterStatus.ACTIVE,
    priority: matter?.priority || MatterPriority.MEDIUM,
    practiceArea: matter?.practiceArea || PracticeArea.CIVIL_LITIGATION,
    clientId: matter?.clientId || ('' as UserId),
    clientName: matter?.clientName || '',
    clientContact: matter?.clientContact || '',
    leadAttorneyId: matter?.leadAttorneyId || (matter as { responsibleAttorneyId?: UserId })?.responsibleAttorneyId || ('' as UserId),
    leadAttorneyName: matter?.leadAttorneyName || (matter as LegacyMatter)?.responsibleAttorneyName || '',
    originatingAttorneyId: matter?.originatingAttorneyId,
    originatingAttorneyName: matter?.originatingAttorneyName,
    conflictCheckCompleted: matter?.conflictCheckCompleted || false,
    conflictCheckDate: matter?.conflictCheckDate,
    conflictCheckNotes: matter?.conflictCheckNotes || '',
    openedDate: matter?.openedDate || new Date().toISOString(),
    targetCloseDate: matter?.targetCloseDate,
    closedDate: matter?.closedDate,
    statute_of_limitations: matter?.statute_of_limitations,
    billingType: matter?.billingType || ('billingArrangement' in (matter || {}) ? (matter as unknown as Record<string, unknown>).billingArrangement as string : undefined) || 'Hourly',
    estimatedValue: matter?.estimatedValue,
    budgetAmount: matter?.budgetAmount,
    retainerAmount: matter?.retainerAmount,
    hourlyRate: matter?.hourlyRate,
    flatFee: matter?.flatFee,
    contingencyPercentage: matter?.contingencyPercentage,
    tags: matter?.tags || [] as string[],
    jurisdictions: matter?.jurisdictions || [] as string[],
    courtName: matter?.courtName || '',
    judgeAssigned: matter?.judgeAssigned || '',
    opposingCounsel: matter?.opposingCounsel || [] as string[],
    teamMembers: matter?.teamMembers || [] as string[],
    customFields: matter?.customFields || {} as Record<string, unknown>,
    ...(matter || {})
  });

  const [loading, setLoading] = useState(false);
  const { errors, validate, clearError, setSubmitError } = useFormValidation();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(formData)) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        teamMembers: formData.teamMembers.map(id => id as UserId)
      } as Partial<Matter>);
    } catch (error) {
      console.error('Failed to save matter:', error);
      setSubmitError('Failed to save matter. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, validate, setSubmitError]);

  const handleChange = useCallback((field: keyof MatterFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  }, [clearError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {matter ? 'Edit Matter' : 'New Matter'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {loading ? 'Saving...' : 'Save Matter'}
          </button>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
          <p className="text-sm text-rose-800 dark:text-rose-200">{errors.submit}</p>
        </div>
      )}

      <BasicInfoSection formData={formData} errors={errors} onChange={handleChange} />
      <ClientSection formData={formData} errors={errors} onChange={handleChange} />
      <AttorneySection formData={formData} errors={errors} onChange={handleChange} />
      <DatesSection formData={formData} errors={errors} onChange={handleChange} />
      <BillingSection formData={formData} onChange={handleChange} />
    </form>
  );
};
