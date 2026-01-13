/**
 * @module hooks/useWizard
 * @category Hooks - UI Utilities
 * 
 * Provides multi-step wizard navigation with boundary detection.
 * Useful for onboarding flows, multi-step forms, and guided processes.
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (currentStep, isFirst, isLast) + actions (next, back, goTo)
 * - NOT action-oriented: Provides step position + navigation controls
 * - Declarative: Consumers query current position and boundaries
 * 
 * STABLE CONTRACT (G43):
 * - Public API: { currentStep, next, back, goTo, isFirst, isLast }
 * - Implementation can change (useState → useReducer) without breaking consumers
 * 
 * PURE COMPUTATION (G42):
 * - isFirst/isLast: Synchronous derivations from currentStep
 * - No effects: Pure state management
 * 
 * FAIL-FAST GUARDS (G54):
 * - goTo validates step is within bounds [1, totalSteps]
 * - next/back use Math.min/Math.max for boundary safety
 * 
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: Functional state updates prevent accumulation
 * - Render-count independent: No internal render tracking
 * 
 * DOMAIN PRIMITIVE (G48):
 * - Encodes wizard navigation semantics
 * - Abstracts step management from components
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
import { WIZARD_DEFAULT_INITIAL_STEP } from '@/config/features/hooks.config';

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
 * G54 (FAIL-FAST): Boundary validation prevents invalid step navigation
 * G49 (IDEMPOTENCY): Functional state updates safe under re-execution
 * 
 * @param totalSteps - Total number of steps in wizard
 * @param initialStep - Initial step number (default: WIZARD_DEFAULT_INITIAL_STEP from config)
 * @returns Object with current step, navigation methods, and boundary flags
 */
export function useWizard(totalSteps: number, initialStep: number = WIZARD_DEFAULT_INITIAL_STEP): UseWizardReturn {
  // G54: Could add validation here
  if (process.env.NODE_ENV !== 'production') {
    if (totalSteps < 1) {
      throw new Error('[useWizard] totalSteps must be >= 1');
    }
    if (initialStep < 1 || initialStep > totalSteps) {
      throw new Error(`[useWizard] initialStep must be between 1 and ${totalSteps}`);
    }
  }

  const [currentStep, setCurrentStep] = useState(initialStep);

  // G54 (FAIL-FAST): Boundary safety via Math.min/Math.max
  const next = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const back = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  // G54 (FAIL-FAST): Explicit validation
  const goTo = (step: number) => {
    if (step >= 1 && step <= totalSteps) setCurrentStep(step);
  };

  // G42 (PURE COMPUTATION): Synchronous derivations
  return {
    currentStep,
    next,
    back,
    goTo,
    isFirst: currentStep === 1,
    isLast: currentStep === totalSteps
  };
};
