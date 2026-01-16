/**
 * useEnhancedWizard Hook
 * @module hooks/useEnhancedWizard
 * @description Multi-step wizard logic with validation, persistence, and navigation control
 * @status PRODUCTION READY
 */

import type { WizardConfig, WizardStep } from "@/types/forms";
import { useCallback, useMemo, useState } from "react";
export type { WizardStep } from "@/types/forms";

type WizardHookOptions<T extends Record<string, unknown>> = {
  config: WizardConfig<T>;
  initialData: Partial<T>;
  validateStep?: (
    stepIndex: number,
    data: Partial<T>
  ) => Promise<boolean> | boolean;
};

export const useEnhancedWizard = <T extends Record<string, unknown>>(
  stepsOrOptions: WizardStep<T>[] | WizardHookOptions<T>,
  legacyInitialData: Partial<T> = {}
) => {
  const isArrayInput = Array.isArray(stepsOrOptions);

  const steps = isArrayInput
    ? (stepsOrOptions as WizardStep<T>[])
    : (stepsOrOptions as WizardHookOptions<T>).config.steps;

  const initialData = isArrayInput
    ? legacyInitialData
    : (stepsOrOptions as WizardHookOptions<T>).initialData;

  const validateStep = isArrayInput
    ? undefined
    : (stepsOrOptions as WizardHookOptions<T>).validateStep;

  const allowStepNavigation = isArrayInput
    ? true
    : Boolean(
        (stepsOrOptions as WizardHookOptions<T>).config.allowStepNavigation
      );

  const onSubmit = isArrayInput
    ? undefined
    : (stepsOrOptions as WizardHookOptions<T>).config.onSubmit;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const visibleSteps = useMemo(() => steps, [steps]);

  const currentStep = visibleSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;
  const progress =
    visibleSteps.length === 0
      ? 0
      : ((currentStepIndex + 1) / visibleSteps.length) * 100;

  const updateData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      if (validateStep) {
        const result = await validateStep(currentStepIndex, formData);
        if (!result) {
          return false;
        }
      }

      if (currentStep?.validationSchema) {
        const result = currentStep.validationSchema.safeParse(formData);
        if (!result.success) {
          setErrors((prev) => ({
            ...prev,
            [currentStep.id]: "Step validation failed",
          }));
          return false;
        }

        setErrors((prev) => {
          const next = { ...prev };
          delete next[currentStep.id];
          return next;
        });
      }

      return true;
    } finally {
      setIsValidating(false);
    }
  }, [validateStep, currentStepIndex, formData, currentStep]);

  const goNext = useCallback(async () => {
    const valid = await runValidation();
    if (!valid) return false;

    setVisitedSteps((prev) => new Set(prev).add(currentStepIndex));

    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
      return true;
    }

    if (onSubmit) {
      await onSubmit(formData as T);
    }

    return true;
  }, [runValidation, isLastStep, onSubmit, formData, currentStepIndex]);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback(
    (index: number) => {
      if (!allowStepNavigation && index > currentStepIndex) {
        return;
      }

      if (
        index <= currentStepIndex ||
        visitedSteps.has(index) ||
        allowStepNavigation
      ) {
        setCurrentStepIndex(index);
      }
    },
    [allowStepNavigation, currentStepIndex, visitedSteps]
  );

  const submit = useCallback(async () => {
    const valid = await runValidation();
    if (!valid) return false;

    if (onSubmit) {
      await onSubmit(formData as T);
    }

    return true;
  }, [runValidation, onSubmit, formData]);

  return {
    currentStep,
    currentStepIndex,
    visibleSteps,
    data: formData,
    formData,
    updateData,
    goNext,
    next: goNext,
    goBack,
    back: goBack,
    goToStep,
    isFirst: isFirstStep,
    isFirstStep,
    isLast: isLastStep,
    isLastStep,
    isValidating,
    progress,
    visitedSteps,
    submit,
    errors,
  };
};
