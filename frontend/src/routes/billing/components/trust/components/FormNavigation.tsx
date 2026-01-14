/**
 * FormNavigation Component
 * Navigation buttons for multi-step form
 */

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onCancel,
  onBack,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <button
        onClick={onCancel}
        className={cn(
          'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          theme.text.secondary,
          'hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        Cancel
      </button>

      <div className="flex items-center gap-3">
        {!isFirstStep && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2',
              'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600',
              theme.text.primary
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {!isLastStep ? (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center gap-2',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Account
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
