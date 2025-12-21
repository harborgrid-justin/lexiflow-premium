/**
 * @module hooks/useFormValidation
 * @category Hooks
 * @description Real-time form validation with debounced checks and progress tracking.
 * 
 * FEATURES:
 * - As-you-type validation with configurable debounce
 * - Field interdependency validation
 * - Progress calculation
 * - Validation state management
 * - Type-safe validation rules
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../config/master.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ValidationRule<T = unknown> = {
  /** Rule name for identification */
  name: string;
  /** Validation function returning error message or null */
  validate: (value: T, allValues?: Record<string, unknown>) => string | null | Promise<string | null>;
  /** Debounce delay in milliseconds (default: 300) */
  debounce?: number;
  /** Run validation on mount */
  validateOnMount?: boolean;
};

export type FieldValidation = {
  /** Current error message */
  error: string | null;
  /** Is field currently being validated */
  isValidating: boolean;
  /** Is field valid */
  isValid: boolean;
  /** Has field been touched */
  isTouched: boolean;
  /** Has field been validated at least once */
  isValidated: boolean;
};

export type FormValidationState<T extends Record<string, any>> = {
  [K in keyof T]: FieldValidation;
};

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export interface UseFormValidationOptions<T extends Record<string, any>> {
  /** Validation schema for all fields */
  schema: ValidationSchema<T>;
  /** Initial form values */
  initialValues: T;
  /** Global debounce delay (default: 300ms) */
  debounceDelay?: number;
  /** Validate all fields on mount */
  validateOnMount?: boolean;
  /** Custom interdependency validator */
  interdependencyValidator?: (values: T) => Record<string, string | null>;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  /** Current form values */
  values: T;
  /** Validation state for each field */
  validationState: FormValidationState<T>;
  /** Set value for a field and trigger validation */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set multiple values at once */
  setValues: (newValues: Partial<T>) => void;
  /** Mark field as touched */
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** Validate specific field */
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  /** Validate all fields */
  validateAll: () => Promise<boolean>;
  /** Reset form to initial values */
  reset: () => void;
  /** Check if form is valid */
  isValid: boolean;
  /** Check if form has errors */
  hasErrors: boolean;
  /** Check if any field is validating */
  isValidating: boolean;
  /** Form completion percentage (0-100) */
  completionPercentage: number;
  /** Get all errors */
  errors: Partial<Record<keyof T, string>>;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Debounce helper
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Calculate form completion percentage
 */
function calculateCompletionPercentage<T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>
): number {
  const fields = Object.keys(schema) as (keyof T)[];
  if (fields.length === 0) return 100;

  const completedFields = fields.filter(field => {
    const value = values[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });

  return Math.round((completedFields.length / fields.length) * 100);
}

// ============================================================================
// HOOK
// ============================================================================

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  debounceDelay = SEARCH_DEBOUNCE_MS,
  validateOnMount = false,
  interdependencyValidator,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  
  // Form values
  const [values, setValuesState] = useState<T>(initialValues);
  
  // Validation state for each field
  const [validationState, setValidationState] = useState<FormValidationState<T>>(() => {
    const initialState = {} as FormValidationState<T>;
    Object.keys(schema).forEach(key => {
      initialState[key as keyof T] = {
        error: null,
        isValidating: false,
        isValid: true,
        isTouched: false,
        isValidated: false,
      };
    });
    return initialState;
  });

  // Debounced validation functions per field
  const debouncedValidators = useRef<Map<keyof T, ReturnType<typeof debounce>>>(new Map());

  // Initialize debounced validators
  useEffect(() => {
    Object.keys(schema).forEach(fieldKey => {
      const field = fieldKey as keyof T;
      if (!debouncedValidators.current.has(field)) {
        const validator = debounce(
          (value: T[keyof T]) => validateFieldImmediate(field, value),
          debounceDelay
        );
        debouncedValidators.current.set(field, validator);
      }
    });
  }, [schema, debounceDelay]);

  /**
   * Validate field immediately (without debounce)
   */
  const validateFieldImmediate = useCallback(async <K extends keyof T>(
    field: K,
    value?: T[K]
  ): Promise<boolean> => {
    const fieldValue = value !== undefined ? value : values[field];
    const rules = schema[field];
    
    if (!rules || rules.length === 0) return true;

    // Set validating state
    setValidationState(prev => ({
      ...prev,
      [field]: { ...prev[field], isValidating: true, isValidated: true },
    }));

    let firstError: string | null = null;

    // Run all validation rules
    for (const rule of rules) {
      try {
        const error = await rule.validate(fieldValue, values);
        if (error && !firstError) {
          firstError = error;
          break; // Stop on first error
        }
      } catch (err) {
        console.error(`Validation error for field ${String(field)}:`, err);
        firstError = 'Validation failed';
        break;
      }
    }

    // Check interdependencies
    if (!firstError && interdependencyValidator) {
      const interdependencyErrors = interdependencyValidator(values);
      if (interdependencyErrors[field as string]) {
        firstError = interdependencyErrors[field as string];
      }
    }

    // Update validation state
    setValidationState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: firstError,
        isValidating: false,
        isValid: !firstError,
        isValidated: true,
      },
    }));

    return !firstError;
  }, [values, schema, interdependencyValidator]);

  /**
   * Validate field (debounced)
   */
  const validateField = useCallback(async <K extends keyof T>(field: K): Promise<boolean> => {
    const validator = debouncedValidators.current.get(field);
    if (validator) {
      validator(values[field]);
    }
    // Return immediate validation for awaitable result
    return validateFieldImmediate(field);
  }, [values, validateFieldImmediate]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async (): Promise<boolean> => {
    const fields = Object.keys(schema) as (keyof T)[];
    const results = await Promise.all(
      fields.map(field => validateFieldImmediate(field))
    );
    return results.every(isValid => isValid);
  }, [schema, validateFieldImmediate]);

  /**
   * Set value for a field and trigger validation
   */
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Trigger debounced validation
    const validator = debouncedValidators.current.get(field);
    if (validator) {
      validator(value);
    }
  }, []);

  /**
   * Set multiple values at once
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    // Trigger validation for all changed fields
    Object.keys(newValues).forEach(fieldKey => {
      const field = fieldKey as keyof T;
      const validator = debouncedValidators.current.get(field);
      if (validator) {
        validator(newValues[field]!);
      }
    });
  }, []);

  /**
   * Mark field as touched
   */
  const setTouched = useCallback(<K extends keyof T>(field: K, touched: boolean = true) => {
    setValidationState(prev => ({
      ...prev,
      [field]: { ...prev[field], isTouched: touched },
    }));
  }, []);

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setValidationState(prev => {
      const resetState = {} as FormValidationState<T>;
      Object.keys(prev).forEach(key => {
        resetState[key as keyof T] = {
          error: null,
          isValidating: false,
          isValid: true,
          isTouched: false,
          isValidated: false,
        };
      });
      return resetState;
    });
  }, [initialValues]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateAll();
    }
  }, [validateOnMount]); // Only run on mount

  // Computed properties
  const isValid = useMemo(
    () => Object.values(validationState).every((state: FieldValidation) => state.isValid),
    [validationState]
  );

  const hasErrors = useMemo(
    () => Object.values(validationState).some((state: FieldValidation) => state.error !== null),
    [validationState]
  );

  const isValidating = useMemo(
    () => Object.values(validationState).some((state: FieldValidation) => state.isValidating),
    [validationState]
  );

  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(values, schema),
    [values, schema]
  );

  const errors = useMemo(() => {
    const errorMap: Partial<Record<keyof T, string>> = {};
    Object.keys(validationState).forEach(key => {
      const field = key as keyof T;
      const state = validationState[field];
      if (state.error) {
        errorMap[field] = state.error;
      }
    });
    return errorMap;
  }, [validationState]);

  return {
    values,
    validationState,
    setValue,
    setValues,
    setTouched,
    validateField,
    validateAll,
    reset,
    isValid,
    hasErrors,
    isValidating,
    completionPercentage,
    errors,
  };
}

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================

export const ValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    name: 'required',
    validate: (value: any) => {
      if (value === null || value === undefined) return message;
      if (typeof value === 'string' && value.trim().length === 0) return message;
      if (Array.isArray(value) && value.length === 0) return message;
      return null;
    },
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    name: 'minLength',
    validate: (value: string) => {
      if (!value) return null; // Let 'required' handle empty values
      return value.length < min 
        ? message || `Must be at least ${min} characters`
        : null;
    },
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    name: 'maxLength',
    validate: (value: string) => {
      if (!value) return null;
      return value.length > max 
        ? message || `Must be at most ${max} characters`
        : null;
    },
  }),

  email: (message: string = 'Invalid email address'): ValidationRule<string> => ({
    name: 'email',
    validate: (value: string) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    },
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    name: 'pattern',
    validate: (value: string) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    name: 'min',
    validate: (value: number) => {
      if (value === null || value === undefined) return null;
      return value < min 
        ? message || `Must be at least ${min}`
        : null;
    },
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    name: 'max',
    validate: (value: number) => {
      if (value === null || value === undefined) return null;
      return value > max 
        ? message || `Must be at most ${max}`
        : null;
    },
  }),

  dateAfter: (compareField: string, message?: string): ValidationRule<string> => ({
    name: 'dateAfter',
    validate: (value: string, allValues?: Record<string, any>) => {
      if (!value || !allValues) return null;
      const compareValue = allValues[compareField];
      if (!compareValue) return null;
      
      const date1 = new Date(value);
      const date2 = new Date(compareValue);
      
      return date1 <= date2 
        ? message || `Must be after ${compareField}`
        : null;
    },
  }),

  custom: <T = any>(
    validateFn: (value: T, allValues?: Record<string, any>) => string | null,
    name: string = 'custom'
  ): ValidationRule<T> => ({
    name,
    validate: validateFn,
  }),
};
