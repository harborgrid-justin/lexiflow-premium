/**
 * @module hooks/useEnhancedWizard
 * @category Hooks - Forms
 * @description Enhanced multi-step wizard with conditional steps, validation, and persistence
 *
 * FEATURES:
 * - Conditional step visibility
 * - Per-step validation
 * - Step progress tracking
 * - Data persistence (localStorage/sessionStorage)
 * - Step navigation with guards
 * - Async step transitions
 * - Step history tracking
 * - Keyboard navigation
 */

import type { FieldCondition, WizardConfig, WizardStep } from "@/types/forms";
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface UseEnhancedWizardOptions<
  TFormData extends Record<string, unknown>,
> {
  /** Wizard configuration */
  config: WizardConfig<TFormData>;
  /** Initial form data */
  initialData: TFormData;
  /** Initial step (default: 0) */
  initialStep?: number;
  /** Validation function per step */
  validateStep?: (
    stepIndex: number,
    data: TFormData
  ) => Promise<boolean> | boolean;
  /** Before step change callback */
  onBeforeStepChange?: (
    fromStep: number,
    toStep: number,
    data: TFormData
  ) => Promise<boolean> | boolean;
  /** After step change callback */
  onAfterStepChange?: (
    fromStep: number,
    toStep: number,
    data: TFormData
  ) => void;
  /** Enable keyboard navigation */
  enableKeyboardNav?: boolean;
}

export interface UseEnhancedWizardReturn<
  TFormData extends Record<string, unknown>,
> {
  /** Current step index */
  currentStepIndex: number;
  /** Current step configuration */
  currentStep: WizardStep<TFormData> | undefined;
  /** All visible steps */
  visibleSteps: WizardStep<TFormData>[];
  /** Total number of visible steps */
  totalSteps: number;
  /** Current form data */
  data: TFormData;
  /** Update form data */
  updateData: (updates: Partial<TFormData>) => void;
  /** Set form data completely */
  setData: (data: TFormData) => void;
  /** Go to next step */
  goNext: () => Promise<boolean>;
  /** Go to previous step */
  goBack: () => void;
  /** Go to specific step */
  goToStep: (stepIndex: number) => Promise<boolean>;
  /** Jump to step by ID */
  goToStepById: (stepId: string) => Promise<boolean>;
  /** Is first step */
  isFirst: boolean;
  /** Is last step */
  isLast: boolean;
  /** Can go to next step */
  canGoNext: boolean;
  /** Can go to previous step */
  canGoBack: boolean;
  /** Is step valid */
  isStepValid: boolean;
  /** Is validating */
  isValidating: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Visited steps */
  visitedSteps: Set<number>;
  /** Reset wizard */
  reset: () => void;
  /** Submit wizard */
  submit: () => Promise<void>;
  /** Errors for current step */
  errors: Record<string, string>;
  /** Set step error */
  setStepError: (field: string, error: string | null) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Evaluate condition
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
 * Evaluate skip conditions
 */
function shouldSkipStep<TFormData extends Record<string, unknown>>(
  step: WizardStep<TFormData>,
  formData: TFormData
): boolean {
  if (!step.skipWhen) return false;

  const conditions = Array.isArray(step.skipWhen)
    ? step.skipWhen
    : [step.skipWhen];
  return conditions.every((condition) =>
    evaluateCondition(condition, formData)
  );
}

/**
 * Get storage
 */
function getStorage(persist: boolean): Storage | null {
  if (!persist || typeof window === "undefined") return null;
  return window.localStorage;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEnhancedWizard<TFormData extends Record<string, unknown>>({
  config,
  initialData,
  initialStep = 0,
  validateStep,
  onBeforeStepChange,
  onAfterStepChange,
  enableKeyboardNav = true,
}: UseEnhancedWizardOptions<TFormData>): UseEnhancedWizardReturn<TFormData> {
  // Load persisted data if enabled
  const loadPersistedData = useCallback((): TFormData => {
    if (config.persistData && config.storageKey) {
      const storage = getStorage(true);
      if (storage) {
        try {
          const stored = storage.getItem(config.storageKey);
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (err) {
          console.error("Failed to load persisted wizard data:", err);
        }
      }
    }
    return initialData;
  }, [config.persistData, config.storageKey, initialData]);

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [data, setDataState] = useState<TFormData>(loadPersistedData);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(
    new Set([initialStep])
  );
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Persist data when it changes
  useEffect(() => {
    if (config.persistData && config.storageKey) {
      const storage = getStorage(true);
      if (storage) {
        try {
          storage.setItem(config.storageKey, JSON.stringify(data));
        } catch (err) {
          console.error("Failed to persist wizard data:", err);
        }
      }
    }
  }, [data, config.persistData, config.storageKey]);

  // Calculate visible steps (excluding skipped steps)
  const visibleSteps = useMemo(() => {
    return config.steps.filter(
      (step) => !shouldSkipStep(step, data) && !step.hidden
    );
  }, [config.steps, data]);

  // Get current step
  const currentStep = useMemo(() => {
    return visibleSteps[currentStepIndex] || visibleSteps[0];
  }, [visibleSteps, currentStepIndex]);

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);

    try {
      // Allow incomplete steps
      if (currentStep?.allowIncomplete) {
        return true;
      }

      // Custom validation
      if (validateStep) {
        const isValid = await validateStep(currentStepIndex, data);
        if (!isValid) {
          return false;
        }
      }

      // Run step validation rules
      if (currentStep?.validationRules) {
        for (const rule of currentStep.validationRules) {
          const result = await rule.validator(data);
          if (!result.valid) {
            // Set error for the fields involved
            rule.fields.forEach((field) => {
              setErrors((prev) => ({
                ...prev,
                [field]: result.message || rule.message || "Validation failed",
              }));
            });
            return false;
          }
        }
      }

      // Clear errors if valid
      setErrors({});
      return true;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, currentStepIndex, data, validateStep]);

  /**
   * Update form data
   */
  const updateData = useCallback((updates: Partial<TFormData>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  /**
   * Set form data completely
   */
  const setData = useCallback((newData: TFormData) => {
    setDataState(newData);
    setErrors({});
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      // Bounds check
      if (stepIndex < 0 || stepIndex >= visibleSteps.length) {
        return false;
      }

      // Skip if already on this step
      if (stepIndex === currentStepIndex) {
        return true;
      }

      // Validate current step if moving forward
      if (stepIndex > currentStepIndex) {
        const isValid = await validateCurrentStep();
        if (!isValid) {
          return false;
        }
      }

      // Before step change guard
      if (onBeforeStepChange) {
        const canChange = await onBeforeStepChange(
          currentStepIndex,
          stepIndex,
          data
        );
        if (!canChange) {
          return false;
        }
      }

      const previousStep = currentStepIndex;

      // Update step
      setCurrentStepIndex(stepIndex);
      setVisitedSteps((prev) => new Set(prev).add(stepIndex));

      // After step change callback
      if (onAfterStepChange) {
        onAfterStepChange(previousStep, stepIndex, data);
      }

      return true;
    },
    [
      currentStepIndex,
      data,
      visibleSteps.length,
      validateCurrentStep,
      onBeforeStepChange,
      onAfterStepChange,
    ]
  );

  /**
   * Go to step by ID
   */
  const goToStepById = useCallback(
    async (stepId: string): Promise<boolean> => {
      const stepIndex = visibleSteps.findIndex((step) => step.id === stepId);
      if (stepIndex === -1) return false;
      return goToStep(stepIndex);
    },
    [visibleSteps, goToStep]
  );

  /**
   * Go to next step
   */
  const goNext = useCallback(async (): Promise<boolean> => {
    if (currentStepIndex >= visibleSteps.length - 1) {
      return false;
    }
    return goToStep(currentStepIndex + 1);
  }, [currentStepIndex, visibleSteps.length, goToStep]);

  /**
   * Go to previous step
   */
  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  /**
   * Reset wizard
   */
  const reset = useCallback(() => {
    setCurrentStepIndex(initialStep);
    setDataState(initialData);
    setVisitedSteps(new Set([initialStep]));
    setErrors({});

    // Clear persisted data
    if (config.persistData && config.storageKey) {
      const storage = getStorage(true);
      if (storage) {
        storage.removeItem(config.storageKey);
      }
    }
  }, [initialStep, initialData, config.persistData, config.storageKey]);

  /**
   * Submit wizard
   */
  const submit = useCallback(async (): Promise<void> => {
    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid) {
      throw new Error("Validation failed");
    }

    // Call submit handler
    if (config.onSubmit) {
      await config.onSubmit(data);
    }

    // Clear persisted data on successful submit
    if (config.persistData && config.storageKey) {
      const storage = getStorage(true);
      if (storage) {
        storage.removeItem(config.storageKey);
      }
    }
  }, [validateCurrentStep, config, data]);

  /**
   * Set step error
   */
  const setStepError = useCallback((field: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || (e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardNav, goNext, goBack]);

  // Computed values
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === visibleSteps.length - 1;
  const canGoNext = !isLast;
  const canGoBack = !isFirst;
  const isStepValid = Object.keys(errors).length === 0;
  const progress =
    visibleSteps.length > 0
      ? Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100)
      : 0;

  return {
    currentStepIndex,
    currentStep,
    visibleSteps,
    totalSteps: visibleSteps.length,
    data,
    updateData,
    setData,
    goNext,
    goBack,
    goToStep,
    goToStepById,
    isFirst,
    isLast,
    canGoNext,
    canGoBack,
    isStepValid,
    isValidating,
    progress,
    visitedSteps,
    reset,
    submit,
    errors,
    setStepError,
  };
}
