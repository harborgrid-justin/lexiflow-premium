/**
 * useForm Hook
 * Comprehensive form management with validation
 */

import { useState, useCallback, FormEvent, ChangeEvent } from 'react';

type ValidationRule<T> = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  validate?: (value: T) => string | boolean;
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormResult<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  resetForm: () => void;
  validateField: <K extends keyof T>(field: K) => string | null;
  validateForm: () => boolean;
}

/**
 * Hook for form state management and validation
 *
 * @example
 * const { values, errors, handleChange, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema: {
 *     email: { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } },
 *     password: { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } }
 *   },
 *   onSubmit: async (values) => { await login(values); }
 * });
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const {
    initialValues,
    validationSchema = {},
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form has been modified
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Check if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0;

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | null => {
      const value = values[field];
      const rules = validationSchema[field];

      if (!rules) return null;

      // Required validation
      if (rules.required) {
        const isEmpty = value === '' || value === null || value === undefined;
        if (isEmpty) {
          return typeof rules.required === 'string' ? rules.required : `${String(field)} is required`;
        }
      }

      // String validations
      if (typeof value === 'string') {
        // Min length
        if (rules.minLength && value.length < rules.minLength.value) {
          return rules.minLength.message;
        }

        // Max length
        if (rules.maxLength && value.length > rules.maxLength.value) {
          return rules.maxLength.message;
        }

        // Pattern
        if (rules.pattern && !rules.pattern.value.test(value)) {
          return rules.pattern.message;
        }
      }

      // Number validations
      if (typeof value === 'number') {
        // Min value
        if (rules.min !== undefined && value < rules.min.value) {
          return rules.min.message;
        }

        // Max value
        if (rules.max !== undefined && value > rules.max.value) {
          return rules.max.message;
        }
      }

      // Custom validation
      if (rules.validate) {
        const result = rules.validate(value);
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return `${String(field)} is invalid`;
        }
      }

      return null;
    },
    [values, validationSchema]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};

    (Object.keys(validationSchema) as Array<keyof T>).forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationSchema, validateField]);

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;

      let fieldValue: any = value;

      // Handle checkbox
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      }

      // Handle number
      if (type === 'number') {
        fieldValue = value === '' ? '' : Number(value);
      }

      setValues(prev => ({ ...prev, [fieldName]: fieldValue }));

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(fieldName);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || undefined,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;

      setTouched(prev => ({ ...prev, [fieldName]: true }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        const error = validateField(fieldName);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || undefined,
        }));
      }
    },
    [validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FormTouched<T>
      );
      setTouched(allTouched);

      // Validate form
      const isFormValid = validateForm();

      if (isFormValid) {
        setIsSubmitting(true);

        Promise.resolve(onSubmit(values))
          .then(() => {
            setIsSubmitting(false);
          })
          .catch(error => {
            console.error('[useForm] Submit error:', error);
            setIsSubmitting(false);
          });
      }
    },
    [values, initialValues, onSubmit, validateForm]
  );

  // Set individual field value
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set individual field error
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set individual field touched
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
}

export default useForm;
