import React, { useState, useEffect } from 'react';
import { 
  Matter, 
  MatterType, 
  MatterStatus, 
  MatterPriority, 
  PracticeArea,
  BillingArrangement,
  UserId 
} from '../../types';
import { Save, X, Calendar, DollarSign, Users, FileText, Building2 } from 'lucide-react';

interface MatterFormProps {
  matter?: Matter;
  onSave: (matter: Partial<Matter>) => Promise<void>;
  onCancel: () => void;
}

export const MatterForm: React.FC<MatterFormProps> = ({ matter, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Matter>>({
    matterNumber: matter?.matterNumber || '',
    title: matter?.title || '',
    description: matter?.description || '',
    matterType: matter?.matterType || matter?.type || MatterType.LITIGATION,
    status: matter?.status || MatterStatus.ACTIVE,
    priority: matter?.priority || MatterPriority.MEDIUM,
    practiceArea: matter?.practiceArea || PracticeArea.CIVIL_LITIGATION,
    clientId: matter?.clientId || ('' as UserId),
    clientName: matter?.clientName || '',
    clientContact: matter?.clientContact || '',
    leadAttorneyId: matter?.leadAttorneyId || matter?.responsibleAttorneyId || ('' as UserId),
    leadAttorneyName: matter?.leadAttorneyName || matter?.responsibleAttorneyName || '',
    originatingAttorneyId: matter?.originatingAttorneyId,
    originatingAttorneyName: matter?.originatingAttorneyName,
    conflictCheckCompleted: matter?.conflictCheckCompleted || false,
    conflictCheckDate: matter?.conflictCheckDate,
    conflictCheckNotes: matter?.conflictCheckNotes || '',
    openedDate: matter?.openedDate || new Date().toISOString(),
    targetCloseDate: matter?.targetCloseDate,
    closedDate: matter?.closedDate,
    statute_of_limitations: matter?.statute_of_limitations,
    billingType: matter?.billingType || matter?.billingArrangement || 'Hourly',
    estimatedValue: matter?.estimatedValue,
    budgetAmount: matter?.budgetAmount,
    retainerAmount: matter?.retainerAmount,
    hourlyRate: matter?.hourlyRate,
    flatFee: matter?.flatFee,
    contingencyPercentage: matter?.contingencyPercentage,
    tags: matter?.tags || [],
    jurisdictions: matter?.jurisdictions || [],
    courtName: matter?.courtName || '',
    judgeAssigned: matter?.judgeAssigned || '',
    opposingCounsel: matter?.opposingCounsel || [],
    teamMembers: matter?.teamMembers || [],
    customFields: matter?.customFields || {},
    ...matter
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Matter title is required';
    }
    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    // Check both new and legacy field names for backward compatibility
    const attorneyName = formData.leadAttorneyName || formData.responsibleAttorneyName;
    if (!attorneyName?.trim()) {
      newErrors.leadAttorneyName = 'Lead attorney is required';
    }
    if (!formData.practiceArea) {
      newErrors.practiceArea = 'Practice area is required';
    }
    // openedDate is required by backend DTO
    if (!formData.openedDate) {
      newErrors.openedDate = 'Opened date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save matter:', error);
      setErrors({ submit: 'Failed to save matter. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Matter, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags?.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
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

      {/* Basic Information */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Matter Number
            </label>
            <input
              type="text"
              value={formData.matterNumber}
              onChange={(e) => handleChange('matterNumber', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Auto-generated if empty"
            />
          </div>

          <div>
            <label htmlFor="matterType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Matter Type *
            </label>
            <select
              id="matterType"
              value={formData.matterType || formData.type || ''}
              onChange={(e) => handleChange('matterType', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {Object.values(MatterType).map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Matter Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 ${
                errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Brief descriptive title"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Detailed matter description"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {Object.values(MatterStatus).map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {Object.values(MatterPriority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Practice Area *
            </label>
            <select
              value={formData.practiceArea}
              onChange={(e) => handleChange('practiceArea', e.target.value)}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 ${
                errors.practiceArea ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {Object.values(PracticeArea).map(area => (
                <option key={area} value={area}>{area.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.practiceArea && <p className="mt-1 text-sm text-rose-600">{errors.practiceArea}</p>}
          </div>
        </div>
      </section>

      {/* Client Information */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Client Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 ${
                errors.clientName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Client or organization name"
            />
            {errors.clientName && <p className="mt-1 text-sm text-rose-600">{errors.clientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Client Contact
            </label>
            <input
              type="text"
              value={formData.clientContact}
              onChange={(e) => handleChange('clientContact', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Primary contact person"
            />
          </div>
        </div>
      </section>

      {/* Attorney Assignment */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Attorney Assignment
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lead Attorney *
            </label>
            <input
              type="text"
              value={formData.leadAttorneyName || formData.responsibleAttorneyName || ''}
              onChange={(e) => handleChange('leadAttorneyName', e.target.value)}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 ${
                errors.leadAttorneyName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Lead attorney name"
            />
            {errors.leadAttorneyName && <p className="mt-1 text-sm text-rose-600">{errors.leadAttorneyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Originating Attorney
            </label>
            <input
              type="text"
              value={formData.originatingAttorneyName || ''}
              onChange={(e) => handleChange('originatingAttorneyName', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Attorney who brought in the matter"
            />
          </div>
        </div>
      </section>

      {/* Conflict Check */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Conflict Check
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="conflictCheckStatus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Conflict Check Status
            </label>
            <select
              id="conflictCheckStatus"
              value={formData.conflictCheckStatus}
              onChange={(e) => handleChange('conflictCheckStatus', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="pending">Pending</option>
              <option value="cleared">Cleared</option>
              <option value="conflict">Conflict Found</option>
              <option value="waived">Conflict Waived</option>
            </select>
          </div>

          <div>
            <label htmlFor="conflictCheckDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Conflict Check Date
            </label>
            <input
              id="conflictCheckDate"
              type="date"
              value={formData.conflictCheckDate ? formData.conflictCheckDate.split('T')[0] : ''}
              onChange={(e) => handleChange('conflictCheckDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Select conflict check date"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Conflict Check Notes
            </label>
            <textarea
              value={formData.conflictCheckNotes}
              onChange={(e) => handleChange('conflictCheckNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Notes about conflict check results"
            />
          </div>
        </div>
      </section>

      {/* Dates */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Important Dates
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="intakeDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Intake Date
            </label>
            <input
              id="intakeDate"
              type="date"
              value={formData.intakeDate ? formData.intakeDate.split('T')[0] : ''}
              onChange={(e) => handleChange('intakeDate', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="openedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Opened Date *
            </label>
            <input
              id="openedDate"
              type="date"
              value={formData.openedDate ? formData.openedDate.split('T')[0] : ''}
              onChange={(e) => handleChange('openedDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 ${
                errors.openedDate ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            {errors.openedDate && <p className="mt-1 text-sm text-rose-600">{errors.openedDate}</p>}
          </div>

          <div>
            <label htmlFor="statuteOfLimitations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Statute of Limitations
            </label>
            <input
              id="statuteOfLimitations"
              type="date"
              value={formData.statute_of_limitations ? formData.statute_of_limitations.split('T')[0] : ''}
              onChange={(e) => handleChange('statute_of_limitations', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </section>

      {/* Billing & Financial */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Billing & Financial
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="billingType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Billing Type
            </label>
            <select
              id="billingType"
              value={formData.billingType || formData.billingArrangement || ''}
              onChange={(e) => handleChange('billingType', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="Hourly">Hourly</option>
              <option value="Flat Fee">Flat Fee</option>
              <option value="Contingency">Contingency</option>
              <option value="Retainer">Retainer</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {(formData.billingType === 'Hourly' || formData.billingArrangement === BillingArrangement.HOURLY) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={formData.hourlyRate || ''}
                onChange={(e) => handleChange('hourlyRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          )}

          {(formData.billingType === 'Flat Fee') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Flat Fee ($)
              </label>
              <input
                type="number"
                value={formData.flatFee || ''}
                onChange={(e) => handleChange('flatFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          )}

          {(formData.billingType === 'Contingency' || formData.billingArrangement === BillingArrangement.CONTINGENCY) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contingency Percentage (%)
              </label>
              <input
                type="number"
                value={formData.contingencyPercentage || ''}
                onChange={(e) => handleChange('contingencyPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                placeholder="0.00"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Estimated Value ($)
            </label>
            <input
              type="number"
              value={formData.estimatedValue || ''}
              onChange={(e) => handleChange('estimatedValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Budget Amount ($)
            </label>
            <input
              type="number"
              value={formData.budgetAmount || ''}
              onChange={(e) => handleChange('budgetAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Retainer Amount ($)
            </label>
            <input
              type="number"
              value={formData.retainerAmount || ''}
              onChange={(e) => handleChange('retainerAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </section>

      {/* Court Information */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Court Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Court Name
            </label>
            <input
              type="text"
              value={formData.courtName}
              onChange={(e) => handleChange('courtName', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="e.g., Superior Court of California"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Judge Assigned
            </label>
            <input
              type="text"
              value={formData.judgeAssigned}
              onChange={(e) => handleChange('judgeAssigned', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Judge name"
            />
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Tags
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <label htmlFor="newTag" className="sr-only">Add new tag</label>
            <input
              id="newTag"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              placeholder="Add tags (e.g., high-value, urgent, settlement)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>
    </form>
  );
};
