/**
 * @module hooks/useWizard
 * @category Hooks - UI Utilities
 * 
 * Provides multi-step wizard navigation with boundary detection.
 * Useful for onboarding flows, multi-step forms, and guided processes.
 * 
 * @example
 * ```typescript
 * const wizard = useWizard(3);
 * 
 * <WizardStep active={wizard.currentStep === 1}>Step 1</WizardStep>
 * <WizardStep active={wizard.currentStep === 2}>Step 2</WizardStep>
 * <WizardStep active={wizard.currentStep === 3}>Step 3</WizardStep>
 * 
 * {!wizard.isFirst && <Button onClick={wizard.back}>Back</Button>}
 * {!wizard.isLast && <Button onClick={wizard.next}>Next</Button>}
 * {wizard.isLast && <Button onClick={handleSubmit}>Submit</Button>}
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useWizard hook
 */
export interface UseWizardReturn {
  /** Current step number (1-indexed) */
  currentStep: number;
  /** Advance to next step */
  next: () => void;
  /** Go back to previous step */
  back: () => void;
  /** Jump to specific step */
  goTo: (step: number) => void;
  /** Whether on first step */
  isFirst: boolean;
  /** Whether on last step */
  isLast: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages multi-step wizard navigation.
 * 
 * @param totalSteps - Total number of steps in wizard
 * @param initialStep - Initial step number (default: 1)
 * @returns Object with current step, navigation methods, and boundary flags
 */
export function useWizard(totalSteps: number, initialStep: number = 1): UseWizardReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const next = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const back = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goTo = (step: number) => {
    if (step >= 1 && step <= totalSteps) setCurrentStep(step);
  };

  return {
    currentStep,
    next,
    back,
    goTo,
    isFirst: currentStep === 1,
    isLast: currentStep === totalSteps
  };
};
