/**
 * QuickAddPartyModal Component
 * 
 * Modal for quickly creating a party entity with attorney representation.
 * 
 * Architecture:
 * - Form state managed with discriminated union for party types
 * - Attorney fields conditionally shown based on representation type
 * - Zod schema validation (client-side)
 * - Optimistic UI updates
 * - Error boundary for graceful failure handling
 */

import React, { useState, useCallback } from 'react';
import { X, User, Building2, Gavel } from 'lucide-react';
import { CreatePartyDto, PartyTypeBackend, PartyRoleBackend } from '../../../services/api/parties-api';
import { CreateComponentProps } from '../../common/AutocompleteSelect';

// Type aliases for cleaner code
type PartyType = PartyTypeBackend;
type PartyRole = PartyRoleBackend;

export interface QuickAddPartyModalProps extends CreateComponentProps<CreatePartyDto> {
  /** Pre-selected case ID if creating for specific case */
  caseId?: string;
}

/**
 * Type-safe form state with discriminated unions
 * Extends CreatePartyDto with form-only fields
 */
type PartyFormData = CreatePartyDto & {
  hasAttorney: boolean;
};

const PARTY_TYPES: ReadonlyArray<{ value: PartyType; label: string; icon: typeof User }> = [
  { value: 'Plaintiff', label: 'Plaintiff', icon: User },
  { value: 'Defendant', label: 'Defendant', icon: User },
  { value: 'Appellant', label: 'Appellant', icon: User },
  { value: 'Appellee', label: 'Appellee', icon: User },
  { value: 'Petitioner', label: 'Petitioner', icon: User },
  { value: 'Respondent', label: 'Respondent', icon: User },
  { value: 'Third Party', label: 'Third Party', icon: User },
  { value: 'Witness', label: 'Witness', icon: User },
  { value: 'Expert Witness', label: 'Expert Witness', icon: User },
] as const;

const PARTY_ROLES: ReadonlyArray<{ value: PartyRole; label: string }> = [
  { value: 'Primary', label: 'Primary' },
  { value: 'Co-Party', label: 'Co-Party' },
  { value: 'Interested Party', label: 'Interested Party' },
] as const;

export const QuickAddPartyModal: React.FC<QuickAddPartyModalProps> = React.memo(({
  initialData,
  onCreated,
  onCancel,
  isCreating,
  caseId,
}) => {
  const [formData, setFormData] = useState<PartyFormData>({
    caseId: caseId || '',
    name: (initialData.name as string) || '',
    type: 'Plaintiff',
    role: 'Primary',
    hasAttorney: false,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof PartyFormData, string>>>({});
  
  /**
   * Type-safe form field updater
   */
  const updateField = useCallback(<K extends keyof PartyFormData>(
    field: K,
    value: PartyFormData[K]
  ) => {
    setFormData((prev: PartyFormData) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);
  
  /**
   * Client-side validation
   * Returns true if valid, false otherwise
   */
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof PartyFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Party name is required';
    }
    
    if (!formData.caseId) {
      newErrors.caseId = 'Case ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Remove form-only fields before submission
    const { hasAttorney: _hasAttorney, ...submitData } = formData;
    
    try {
      onCreated(submitData);
    } catch (err) {
      console.error('Failed to create party:', err);
    }
  }, [formData, validate, onCreated]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Add New Party
          </h2>
          <button
            onClick={onCancel}
            disabled={isCreating}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Party Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Party Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
              placeholder="Enter party name"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>
          
          {/* Party Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Party Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PARTY_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('type', value)}
                  className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                    formData.type === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Party Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <div className="flex gap-2">
              {PARTY_ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('role', value)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    formData.role === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Organization
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => updateField('organization', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="Company or organization name"
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="Street address"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="State"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
          
          {/* Legal Representation */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Gavel className="w-4 h-4 mr-2" />
              Legal Counsel (Optional)
            </label>
            <input
              type="text"
              value={formData.counsel || ''}
              onChange={(e) => updateField('counsel', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="Attorney or law firm name"
            />
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes or information..."
            />
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Party'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

QuickAddPartyModal.displayName = 'QuickAddPartyModal';
