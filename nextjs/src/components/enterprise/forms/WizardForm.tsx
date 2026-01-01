/**
 * @module components/enterprise/forms/WizardForm
 * @category Enterprise - Forms
 * @description Multi-step wizard form component with progress indicator
 *
 * FEATURES:
 * - Step-by-step navigation
 * - Progress indicator
 * - Per-step validation
 * - Conditional steps
 * - Data persistence
 * - Keyboard shortcuts
 */

import React from 'react';
import { useEnhancedWizard } from '@/hooks/useEnhancedWizard';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import type { WizardConfig } from '@/types/forms';
import { FormField } from './FormField';
import { FormSectionComponent } from './FormSection';

// ============================================================================
// TYPES
// ============================================================================

export interface WizardFormProps<TFormData extends Record<string, unknown>> {
  /** Wizard configuration */
  config: WizardConfig<TFormData>;
  /** Initial form data */
  initialData: TFormData;
  /** Validation function */
  onValidate?: (stepIndex: number, data: TFormData) => Promise<boolean> | boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardForm<TFormData extends Record<string, unknown>>({
  config,
  initialData,
  onValidate,
  className,
}: WizardFormProps<TFormData>) {
  const { theme } = useTheme();

  const wizard = useEnhancedWizard({
    config,
    initialData,
    validateStep: onValidate,
  });

  const {
    currentStep,
    currentStepIndex,
    visibleSteps,
    data,
    updateData,
    goNext,
    goBack,
    goToStep,
    isFirst,
    isLast,
    isValidating,
    progress,
    visitedSteps,
    submit,
    errors,
  } = wizard;

  /**
   * Handle step submission
   */
  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLast) {
      await submit();
    } else {
      await goNext();
    }
  };

  /**
   * Render progress indicator
   */
  const renderProgress = () => {
    if (!config.showProgress) return null;

    const progressType = config.progressType || 'steps';

    if (progressType === 'bar') {
      return (
        <div className="mb-8">
          <div className={cn('h-2 rounded-full', 'bg-gray-200')}>
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Wizard progress"
            />
          </div>
          <div className={cn('text-sm text-right mt-1', theme.text.secondary)}>
            Step {currentStepIndex + 1} of {visibleSteps.length}
          </div>
        </div>
      );
    }

    if (progressType === 'dots') {
      return (
        <div className="flex items-center justify-center gap-2 mb-8">
          {visibleSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => config.allowStepNavigation && goToStep(index)}
              disabled={!config.allowStepNavigation}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                index === currentStepIndex
                  ? 'bg-blue-600 scale-125'
                  : visitedSteps.has(index)
                  ? 'bg-blue-400'
                  : 'bg-gray-300',
                config.allowStepNavigation && 'cursor-pointer hover:scale-110'
              )}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={index === currentStepIndex ? 'step' : undefined}
            />
          ))}
        </div>
      );
    }

    // Default: steps progress
    return (
      <nav aria-label="Wizard progress" className="mb-8">
        <ol className="flex items-center">
          {visibleSteps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                'flex items-center',
                index < visibleSteps.length - 1 && 'flex-1'
              )}
            >
              <button
                type="button"
                onClick={() => config.allowStepNavigation && goToStep(index)}
                disabled={!config.allowStepNavigation}
                className={cn(
                  'flex items-center gap-2',
                  config.allowStepNavigation && 'cursor-pointer'
                )}
                aria-current={index === currentStepIndex ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                    index === currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : visitedSteps.has(index)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {visitedSteps.has(index) && index !== currentStepIndex ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    index === currentStepIndex
                      ? theme.text.primary
                      : theme.text.secondary
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-4',
                    visitedSteps.has(index + 1) ? 'bg-blue-400' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    if (!currentStep) return null;

    // Custom component
    if (currentStep.component) {
      const CustomComponent = currentStep.component;
      return (
        <CustomComponent
          data={data}
          updateData={updateData}
          errors={errors}
          goNext={goNext}
          goBack={goBack}
          isFirst={isFirst}
          isLast={isLast}
        />
      );
    }

    // Sections
    if (currentStep.sections) {
      return (
        <div className="space-y-6">
          {currentStep.sections.map(section => (
            <FormSectionComponent
              key={section.id}
              section={section}
              collapsible={section.collapsible}
              defaultCollapsed={section.defaultCollapsed}
            >
              <div className="space-y-4">
                {section.fields.map(field => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={data[field.name as keyof TFormData]}
                    onChange={(value) =>
                      updateData({ [field.name]: value } as Partial<TFormData>)
                    }
                    error={errors[field.name]}
                  />
                ))}
              </div>
            </FormSectionComponent>
          ))}
        </div>
      );
    }

    // Fields
    if (currentStep.fields) {
      return (
        <div className="space-y-4">
          {currentStep.fields.map(field => (
            <FormField
              key={field.name}
              field={field}
              value={data[field.name as keyof TFormData]}
              onChange={(value) =>
                updateData({ [field.name]: value } as Partial<TFormData>)
              }
              error={errors[field.name]}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const nextButtonText = currentStep?.nextButtonText || (isLast ? 'Submit' : 'Next');
  const backButtonText = currentStep?.backButtonText || 'Back';

  return (
    <div className={cn('wizard-form w-full max-w-4xl mx-auto', className)}>
      {/* Wizard Title */}
      {config.title && (
        <div className="mb-8 text-center">
          <h1 className={cn('text-3xl font-bold', theme.text.primary)}>
            {config.title}
          </h1>
          {config.description && (
            <p className={cn('mt-2 text-lg', theme.text.secondary)}>
              {config.description}
            </p>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {renderProgress()}

      {/* Step Content */}
      <form onSubmit={handleStepSubmit}>
        <div className={cn('bg-white rounded-lg shadow-sm border p-8', theme.border.default)}>
          {/* Step Title */}
          <div className="mb-6">
            <h2 className={cn('text-2xl font-semibold', theme.text.primary)}>
              {currentStep?.icon && (
                <span className="mr-2">{currentStep.icon}</span>
              )}
              {currentStep?.title}
            </h2>
            {currentStep?.description && (
              <p className={cn('mt-2', theme.text.secondary)}>
                {currentStep.description}
              </p>
            )}
          </div>

          {/* Step Fields */}
          <div className="mb-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium transition-colors',
                'border',
                theme.border.default,
                theme.text.primary,
                'hover:bg-gray-50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              )}
            >
              {backButtonText}
            </button>

            <div className="flex items-center gap-3">
              {config.onCancel && (
                <button
                  type="button"
                  onClick={config.onCancel}
                  className={cn(
                    'px-6 py-2.5 rounded-lg font-medium transition-colors',
                    theme.text.secondary,
                    'hover:text-red-600',
                    'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  )}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isValidating}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-colors',
                  'bg-blue-600 text-white',
                  'hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                {isValidating ? 'Validating...' : nextButtonText}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Keyboard shortcuts hint */}
      <div className={cn('mt-4 text-center text-xs', theme.text.secondary)}>
        <kbd className="px-2 py-1 rounded bg-gray-100">←</kbd> Previous •{' '}
        <kbd className="px-2 py-1 rounded bg-gray-100">→</kbd> Next •{' '}
        <kbd className="px-2 py-1 rounded bg-gray-100">Ctrl+Enter</kbd> Submit
      </div>
    </div>
  );
}

WizardForm.displayName = 'WizardForm';
