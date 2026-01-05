/**
 * @module components/common/Stepper
 * @category Common
 * @description Multi-step progress indicator.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Check } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

/**
 * Stepper - React 18 optimized with React.memo
 */
export const Stepper = React.memo<StepperProps>(({ steps, currentStep, onStepClick, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between relative">
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 -z-10", theme.border.default)} />
        
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          
          return (
            <div 
              key={label} 
              className={cn("flex flex-col items-center group", onStepClick ? "cursor-pointer" : "cursor-default")} 
              onClick={() => onStepClick && stepNum < currentStep && onStepClick(stepNum)}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors z-10",
                  isCompleted 
                    ? cn(theme.primary.DEFAULT, "border-transparent text-white") 
                    : isActive 
                      ? cn(theme.surface.default, theme.primary.border, theme.primary.text) 
                      : cn(theme.surface.default, theme.border.default, theme.text.tertiary)
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium px-2 py-0.5 rounded",
                  theme.surface.default, 
                  isActive ? theme.primary.text : theme.text.secondary
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
