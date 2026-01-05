/**
 * @module hooks/useEnhancedFormValidation
 * @category Hooks - Forms
 * @description Advanced form validation with async validation, cross-field rules, and conditional logic
 *
 * FEATURES:
 * - Async and sync validation support
 * - Cross-field validation rules
 * - Conditional field visibility
 * - Debounced async validation
 * - Validation severity levels (error/warning/info)
 * - Field dependency tracking
 * - Optimistic validation updates
 * - Smart re-validation
 */

import { SEARCH_DEBOUNCE_MS } from "@/config/features/search.config";
import type {
  FieldCondition,
  FieldSchema,
  FieldState,
  FormSchema,
  FormState,
  ValidationResult,
  ValidationRule,
} from "@/types/forms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface UseEnhancedFormValidationOptions<
  TFormData extends Record<string, unknown>,
> {
  /** Form schema with field definitions */
  schema: FormSchema<TFormData>;
  /** Initial form values */
  initialValues: TFormData;
  /** Validation mode */
  validationMode?: "onChange" | "onBlur" | "onSubmit" | "all";
  /** Re-validate mode after first validation */
  revalidateMode?: "onChange" | "onBlur" | "onSubmit";
  /** Global debounce delay for async validations */
  debounceDelay?: number;
  /** Validate on mount */
  validateOnMount?: boolean;
}

export interface UseEnhancedFormValidationReturn<
  TFormData extends Record<string, unknown>,
> {
  /** Current form state */
  formState: FormState<TFormData>;
  /** Get field state */
  getFieldState: <K extends keyof TFormData>(field: K) => FieldState;
  /** Set field value */
  setValue: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  /** Set multiple field values */
  setValues: (values: Partial<TFormData>) => void;
  /** Set field touched */
  setTouched: <K extends keyof TFormData>(field: K, touched?: boolean) => void;
  /** Set field error manually */
  setError: <K extends keyof TFormData>(field: K, error: string | null) => void;
  /** Validate specific field */
  validateField: <K extends keyof TFormData>(field: K) => Promise<boolean>;
  /** Validate all fields */
  validateAll: () => Promise<boolean>;
  /** Reset form to initial state */
  reset: (newValues?: TFormData) => void;
  /** Check if field is visible based on conditions */
  isFieldVisible: (field: keyof TFormData) => boolean;
  /** Get all visible fields */
  getVisibleFields: () => Array<keyof TFormData>;
  /** Get all errors */
  errors: Partial<Record<keyof TFormData, string>>;
  /** Get all warnings */
  warnings: Partial<Record<keyof TFormData, string>>;
  /** Is form valid */
  isValid: boolean;
  /** Is any field validating */
  isValidating: boolean;
  /** Is form dirty */
  isDirty: boolean;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Debounce helper for async operations
 */
function debounce<T extends (...args: unknown[]) => unknown>(
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
 * Check if field condition is met
 */
function evaluateCondition<TFormData extends Record<string, unknown>>(
  condition: FieldCondition<TFormData>,
  formData: TFormData
): boolean {
  const fieldValue = formData[condition.field];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;
    case "notEquals":
      return fieldValue !== condition.value;
    case "contains":
      if (
        typeof fieldValue === "string" &&
        typeof condition.value === "string"
      ) {
        return fieldValue.includes(condition.value);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      return false;
    case "greaterThan":
      return typeof fieldValue === "number" &&
        typeof condition.value === "number"
        ? fieldValue > condition.value
        : false;
    case "lessThan":
      return typeof fieldValue === "number" &&
        typeof condition.value === "number"
        ? fieldValue < condition.value
        : false;
    case "isEmpty":
      if (fieldValue === null || fieldValue === undefined) return true;
      if (typeof fieldValue === "string") return fieldValue.trim().length === 0;
      if (Array.isArray(fieldValue)) return fieldValue.length === 0;
      return false;
    case "isNotEmpty":
      if (fieldValue === null || fieldValue === undefined) return false;
      if (typeof fieldValue === "string") return fieldValue.trim().length > 0;
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      return true;
    default:
      return true;
  }
}

/**
 * Evaluate multiple conditions (AND logic)
 */
function evaluateConditions<TFormData extends Record<string, unknown>>(
  conditions:
    | FieldCondition<TFormData>
    | FieldCondition<TFormData>[]
    | undefined,
  formData: TFormData
): boolean {
  if (!conditions) return true;

  const conditionArray = Array.isArray(conditions) ? conditions : [conditions];
  return conditionArray.every((condition) =>
    evaluateCondition(condition, formData)
  );
}

/**
 * Get field schema by name
 */
function getFieldSchema(
  schema: FormSchema,
  fieldName: string
): FieldSchema | undefined {
  // Check flat fields
  if (schema.fields) {
    const field = schema.fields.find((f) => f.name === fieldName);
    if (field) return field;
  }

  // Check sections
  if (schema.sections) {
    for (const section of schema.sections) {
      const field = section.fields.find((f) => f.name === fieldName);
      if (field) return field;
    }
  }

  return undefined;
}

/**
 * Execute validation rule
 */
async function executeValidationRule<T>(
  rule: ValidationRule<T>,
  value: T,
  formData: Record<string, unknown>
): Promise<ValidationResult> {
  try {
    const result = await rule.validator(value, formData);
    return result;
  } catch (error) {
    console.error(`Validation error for rule "${rule.name}":`, error);
    return {
      valid: false,
      message: rule.message || "Validation failed",
      severity: "error",
    };
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useEnhancedFormValidation<
  TFormData extends Record<string, unknown>,
>({
  schema,
  initialValues,
  validationMode = "onChange",
  revalidateMode = "onChange",
  debounceDelay = SEARCH_DEBOUNCE_MS,
  validateOnMount = false,
}: UseEnhancedFormValidationOptions<TFormData>): UseEnhancedFormValidationReturn<TFormData> {
  // Form data
  const [formData, setFormData] = useState<TFormData>(initialValues);
  const initialValuesRef = useRef(initialValues);

  // Field states
  const [fieldStates, setFieldStates] = useState<
    Record<keyof TFormData, FieldState>
  >(() => {
    const states = {} as Record<keyof TFormData, FieldState>;
    Object.keys(initialValues).forEach((key) => {
      states[key as keyof TFormData] = {
        value: initialValues[key as keyof TFormData],
        touched: false,
        dirty: false,
        error: null,
        warning: null,
        validating: false,
        disabled: false,
        visible: true,
      };
    });
    return states;
  });

  // Form-level state
  const [submitCount, setSubmitCount] = useState(0);

  // Track which fields have been validated
  const validatedFields = useRef<Set<keyof TFormData>>(new Set());

  // Debounced validators per field
  const debouncedValidators = useRef<
    Map<keyof TFormData, ReturnType<typeof debounce>>
  >(new Map());

  /**
   * Check if field is visible based on conditions
   */
  const isFieldVisible = useCallback(
    (fieldName: keyof TFormData): boolean => {
      const fieldSchema = getFieldSchema(
        schema as unknown as FormSchema<Record<string, unknown>>,
        fieldName as string
      );
      if (!fieldSchema?.showWhen) return true;

      return evaluateConditions(fieldSchema.showWhen, formData);
    },
    [schema, formData]
  );

  /**
   * Get all visible fields
   */
  const getVisibleFields = useCallback((): Array<keyof TFormData> => {
    return (Object.keys(formData) as Array<keyof TFormData>).filter(
      isFieldVisible
    );
  }, [formData, isFieldVisible]);

  /**
   * Validate field immediately
   */
  const validateFieldImmediate = useCallback(
    async <K extends keyof TFormData>(field: K): Promise<boolean> => {
      const fieldSchema = getFieldSchema(
        schema as unknown as FormSchema<Record<string, unknown>>,
        field as string
      );
      const fieldValue = formData[field];

      // Mark field as validating
      setFieldStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], validating: true },
      }));

      let error: string | null = null;
      let warning: string | null = null;

      // Check required
      if (fieldSchema?.required) {
        const isEmpty =
          fieldValue === null ||
          fieldValue === undefined ||
          (typeof fieldValue === "string" && fieldValue.trim().length === 0) ||
          (Array.isArray(fieldValue) && fieldValue.length === 0);

        if (isEmpty) {
          error = `${fieldSchema.label} is required`;
        }
      }

      // Run field-level validations
      if (!error && fieldSchema?.validationRules) {
        for (const rule of fieldSchema.validationRules) {
          const result = await executeValidationRule(
            rule as ValidationRule<unknown>,
            fieldValue,
            formData
          );

          if (!result.valid) {
            if (result.severity === "warning") {
              warning = result.message || rule.message || "Validation warning";
            } else {
              error = result.message || rule.message || "Validation failed";
              break; // Stop on first error
            }
          }
        }
      }

      // Run cross-field validations that involve this field
      if (!error && schema.crossFieldValidations) {
        for (const crossRule of schema.crossFieldValidations) {
          if (crossRule.fields.includes(field)) {
            const result = await crossRule.validator(formData);
            if (!result.valid && result.severity !== "warning") {
              error =
                result.message || crossRule.message || "Validation failed";
              break;
            }
          }
        }
      }

      // Update field state
      setFieldStates((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          error,
          warning,
          validating: false,
        },
      }));

      validatedFields.current.add(field);

      return !error;
    },
    [formData, schema]
  );

  /**
   * Validate field (debounced for async)
   */
  const validateField = useCallback(
    async <K extends keyof TFormData>(field: K): Promise<boolean> => {
      return validateFieldImmediate(field);
    },
    [validateFieldImmediate]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async (): Promise<boolean> => {
    const visibleFields = getVisibleFields();
    const results = await Promise.all(
      visibleFields.map((field) => validateFieldImmediate(field))
    );
    return results.every((result) => result);
  }, [getVisibleFields, validateFieldImmediate]);

  /**
   * Set field value and trigger validation if needed
   */
  const setValue = useCallback(
    <K extends keyof TFormData>(field: K, value: TFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFieldStates((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          value,
          dirty: true,
        },
      }));

      // Trigger validation based on mode
      const shouldValidate =
        validationMode === "onChange" ||
        validationMode === "all" ||
        (validatedFields.current.has(field) && revalidateMode === "onChange");

      if (shouldValidate) {
        // Use debounced validation for async validators
        const fieldSchema = getFieldSchema(
          schema as unknown as FormSchema<Record<string, unknown>>,
          field as string
        );
        const hasAsyncValidation = fieldSchema?.validationRules?.some(
          (rule) => rule.debounce !== undefined
        );

        if (hasAsyncValidation) {
          let validator = debouncedValidators.current.get(field);
          if (!validator) {
            validator = debounce(
              () => validateFieldImmediate(field),
              debounceDelay
            );
            debouncedValidators.current.set(field, validator);
          }
          validator();
        } else {
          validateFieldImmediate(field);
        }
      }
    },
    [
      validationMode,
      revalidateMode,
      schema,
      debounceDelay,
      validateFieldImmediate,
    ]
  );

  /**
   * Set multiple field values
   */
  const setValues = useCallback(
    (values: Partial<TFormData>) => {
      setFormData((prev) => ({ ...prev, ...values }));
      setFieldStates((prev) => {
        const newStates = { ...prev };
        Object.keys(values).forEach((key) => {
          const field = key as keyof TFormData;
          newStates[field] = {
            ...prev[field],
            value: values[field]!,
            dirty: true,
          };
        });
        return newStates;
      });

      // Validate changed fields if needed
      const shouldValidate =
        validationMode === "onChange" || validationMode === "all";
      if (shouldValidate) {
        Object.keys(values).forEach((key) => {
          validateFieldImmediate(key as keyof TFormData);
        });
      }
    },
    [validationMode, validateFieldImmediate]
  );

  /**
   * Set field touched state
   */
  const setTouched = useCallback(
    <K extends keyof TFormData>(field: K, touched = true) => {
      setFieldStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], touched },
      }));

      // Validate on blur if configured
      if (
        touched &&
        (validationMode === "onBlur" || validationMode === "all")
      ) {
        validateFieldImmediate(field);
      }
    },
    [validationMode, validateFieldImmediate]
  );

  /**
   * Set field error manually
   */
  const setError = useCallback(
    <K extends keyof TFormData>(field: K, error: string | null) => {
      setFieldStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], error },
      }));
    },
    []
  );

  /**
   * Reset form
   */
  const reset = useCallback((newValues?: TFormData) => {
    const values = newValues || initialValuesRef.current;
    setFormData(values);
    setFieldStates((prev) => {
      const resetStates = { ...prev };
      Object.keys(values).forEach((key) => {
        const field = key as keyof TFormData;
        resetStates[field] = {
          value: values[field],
          touched: false,
          dirty: false,
          error: null,
          warning: null,
          validating: false,
          disabled: false,
          visible: true,
        };
      });
      return resetStates;
    });
    validatedFields.current.clear();
    setSubmitCount(0);
  }, []);

  /**
   * Get field state
   */
  const getFieldState = useCallback(
    <K extends keyof TFormData>(field: K): FieldState => {
      return fieldStates[field];
    },
    [fieldStates]
  );

  // Update field visibility based on conditions
  useEffect(() => {
    setFieldStates((prev) => {
      const newStates = { ...prev };
      Object.keys(formData).forEach((key) => {
        const field = key as keyof TFormData;
        const visible = isFieldVisible(field);
        if (newStates[field].visible !== visible) {
          newStates[field] = { ...newStates[field], visible };
        }
      });
      return newStates;
    });
  }, [formData, isFieldVisible]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateAll();
    }
  }, [validateOnMount, validateAll]);

  // Computed values
  const errors = useMemo(() => {
    const errorMap: Partial<Record<keyof TFormData, string>> = {};
    Object.entries(fieldStates).forEach(([key, state]) => {
      if (state.error) {
        errorMap[key as keyof TFormData] = state.error;
      }
    });
    return errorMap;
  }, [fieldStates]);

  const warnings = useMemo(() => {
    const warningMap: Partial<Record<keyof TFormData, string>> = {};
    Object.entries(fieldStates).forEach(([key, state]) => {
      if (state.warning) {
        warningMap[key as keyof TFormData] = state.warning;
      }
    });
    return warningMap;
  }, [fieldStates]);

  const isValid = useMemo(() => {
    return Object.values(fieldStates).every(
      (state: FieldState) => !state.error
    );
  }, [fieldStates]);

  const isValidating = useMemo(() => {
    return Object.values(fieldStates).some(
      (state: FieldState) => state.validating
    );
  }, [fieldStates]);

  const isDirty = useMemo(() => {
    return Object.values(fieldStates).some((state: FieldState) => state.dirty);
  }, [fieldStates]);

  const formState: FormState<TFormData> = useMemo(
    () => ({
      data: formData,
      fields: fieldStates,
      isValid,
      isSubmitting: false,
      isDirty,
      submitCount,
      errors: errors as Record<string, string>,
    }),
    [formData, fieldStates, isValid, isDirty, submitCount, errors]
  );

  return {
    formState,
    getFieldState,
    setValue,
    setValues,
    setTouched,
    setError,
    validateField,
    validateAll,
    reset,
    isFieldVisible,
    getVisibleFields,
    errors,
    warnings,
    isValid,
    isValidating,
    isDirty,
  };
}
