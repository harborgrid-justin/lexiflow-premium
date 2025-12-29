import { useState, useCallback } from 'react';
import type { MatterFormData, FormErrors } from './types';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((formData: MatterFormData): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Matter title is required';
    }
    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    const attorneyName = formData.leadAttorneyName || (formData as Record<string, unknown>).responsibleAttorneyName;
    if (!attorneyName?.trim()) {
      newErrors.leadAttorneyName = 'Lead attorney is required';
    }
    if (!formData.practiceArea) {
      newErrors.practiceArea = 'Practice area is required';
    }
    if (!formData.openedDate) {
      newErrors.openedDate = 'Opened date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const setSubmitError = useCallback((message: string) => {
    setErrors(prev => ({ ...prev, submit: message }));
  }, []);

  return { errors, validate, clearError, setSubmitError, setErrors };
};
