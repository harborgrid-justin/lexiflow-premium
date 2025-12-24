/**
 * @module hooks/useWizard
 * @category Hooks - UI Utilities
 * @description Multi-step wizard navigation hook with next/back/goTo controls and boundary helpers.
 * Manages currentStep state with clamping (1 to totalSteps), provides isFirst/isLast flags for
 * UI conditional rendering (e.g., hiding Back button on first step, showing Submit on last).
 * 
 * NO THEME USAGE: Utility hook for wizard step management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useWizard = (totalSteps: number, initialStep: number = 1) => {
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
