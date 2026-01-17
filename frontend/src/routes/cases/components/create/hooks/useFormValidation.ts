/**
 * Custom hook for form validation logic
 */

import { useState, useCallback } from 'react';

import { type ConflictStatus } from './useConflictCheck';

export interface UseFormValidationResult {
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validate: () => boolean;
  clearFieldError: (field: string) => void;
}

export const useFormValidation = (
  formData: { title?: string; clientName?: string; responsibleAttorneyName?: string },
  conflictStatus: ConflictStatus
): UseFormValidationResult => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.responsibleAttorneyName?.trim()) {
      newErrors.responsibleAttorneyName = 'Responsible attorney is required';
    }

    if (conflictStatus === 'conflict') {
      newErrors.conflict = 'Conflict of interest detected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.title, formData.clientName, formData.responsibleAttorneyName, conflictStatus]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    setErrors,
    validate,
    clearFieldError,
  };
};
