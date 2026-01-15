/**
 * StepIndicator Component
 * Visual progress indicator for multi-step forms
 */

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';
export interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isActive && 'border-blue-600 bg-blue-600 text-white',
                  isCompleted && 'border-emerald-600 bg-emerald-600 text-white',
                  !isActive && !isCompleted && cn('border-slate-300 dark:border-slate-700', theme.text.secondary)
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn('text-xs mt-2', isActive ? 'font-bold' : theme.text.secondary)}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  isCompleted ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
