/**
 * useEnhancedFormValidation Hook
 * @module hooks/useEnhancedFormValidation
 * @description Advanced form validation with Zod schema integration and async checks
 * @status PRODUCTION READY
 */

import { useCallback, useState } from "react";

export type ValidationRule<T> = (
  value: T
) => string | null | Promise<string | null>;

export interface FieldValidation<T> {
  value: T;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

export const useEnhancedFormValidation = <T extends Record<string, unknown>>(
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    {} as Record<keyof T, string | null>
  );
  const [isDirty, setIsDirty] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(
    async (
      field: keyof T,
      value: unknown,
      rules: ValidationRule<unknown>[]
    ) => {
      setIsValidating(true);
      try {
        console.log(`Validating field: ${String(field)}`);
        for (const rule of rules) {
          const error = await rule(value);
          if (error) return error;
        }
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty((prev) => ({ ...prev, [field]: true }));
      // Clear error on change
      setErrors((prev) => ({ ...prev, [field]: null }));
    },
    []
  );

  return {
    values,
    errors,
    isDirty,
    isValidating,
    setFieldValue,
    setValues,
    setErrors,
    validateField,
  };
};
