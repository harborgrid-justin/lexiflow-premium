
import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          
          return (
            <div key={label} className="flex flex-col items-center group cursor-pointer" onClick={() => onStepClick && stepNum < currentStep && onStepClick(stepNum)}>
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isActive 
                      ? 'bg-white border-blue-600 text-blue-600' 
                      : 'bg-white border-slate-300 text-slate-400'
                  }
                `}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
