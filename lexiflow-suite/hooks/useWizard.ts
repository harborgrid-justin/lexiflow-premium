
import { useState } from 'react';

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
