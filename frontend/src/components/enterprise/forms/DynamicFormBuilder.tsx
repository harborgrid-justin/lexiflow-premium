/**
 * @module components/enterprise/forms/DynamicFormBuilder
 * @category Enterprise - Forms
 * @description Dynamic form builder that generates forms from JSON schemas
 *
 * FEATURES:
 * - Schema-driven form generation
 * - Automatic field rendering based on type
 * - Built-in validation
 * - Conditional field visibility
 * - Section/fieldset support
 * - Responsive layouts
 * - Accessibility features
 */

import React, { useCallback, useMemo } from 'react';

import { useEnhancedAutoSave } from '@/hooks/useEnhancedAutoSave';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';


// Import field components (to be created)
import { FormField } from './FormField';
import { FormSectionComponent } from './FormSection';

import type {
  FieldSchema,
  FormConfig,
  FormSection,
} from '@/types/forms';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for custom field renderer components
 */
export interface CustomFieldRendererProps<TFieldValue = unknown> {
  /** Field configuration */
  field: FieldSchema;
  /** Current field value */
  value: TFieldValue;
  /** Change handler */
  onChange: (value: TFieldValue) => void;
  /** Blur handler */
  onBlur: () => void;
  /** Validation error */
  error?: string;
  /** Validation warning */
  warning?: string;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field read-only */
  readOnly?: boolean;
}

export interface DynamicFormBuilderProps<TFormData extends Record<string, unknown>> {
  /** Form configuration */
  config: FormConfig<TFormData>;
  /** Custom field renderers by field type */
  customRenderers?: Partial<Record<string, React.ComponentType<CustomFieldRendererProps>>>;
  /** Additional CSS classes */
  className?: string;
  /** Show form actions (submit, cancel, reset) */
  showActions?: boolean;
  /** Is form loading */
  isLoading?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DynamicFormBuilder<TFormData extends Record<string, unknown>>({
  config,
  customRenderers,
  className,
  showActions = true,
  isLoading = false,
  readOnly = false,
}: DynamicFormBuilderProps<TFormData>) {
  const { theme } = useTheme();
  const { schema, initialValues, onSubmit, onCancel } = config;

  // Form validation
  const {
    formState,
    setValue,
    setTouched,
    validateAll,
    reset,
    isFieldVisible,
    errors,
    warnings,
    isValid,
    isValidating,
  } = useEnhancedFormValidation({
    schema,
    initialValues,
    validationMode: config.validationMode || 'onChange',
    revalidateMode: config.revalidateMode || 'onChange',
  });

  // Auto-save (if enabled)
  const autoSave = useEnhancedAutoSave({
    data: formState.data,
    onSave: async (data) => {
      if (schema.autoSave?.onSave) {
        await schema.autoSave.onSave(data);
      }
      return { success: true };
    },
    enabled: config.enableAutoSave || schema.autoSave?.enabled || false,
    delay: config.autoSaveDelay || schema.autoSave?.delay,
    onSuccess: schema.autoSave?.onSuccess,
    onError: schema.autoSave?.onError,
  });

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const isFormValid = await validateAll();
      if (!isFormValid) {
        return;
      }

      try {
        await onSubmit(formState.data);
        config.onSuccess?.();
      } catch (error) {
        config.onError?.(error as Error);
      }
    },
    [validateAll, onSubmit, formState.data, config]
  );

  /**
   * Handle form reset
   */
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  /**
   * Render field
   */
  const renderField = useCallback(
    (field: FieldSchema) => {
      const fieldName = field.name as keyof TFormData;

      // Check if field is visible
      if (!isFieldVisible(fieldName)) {
        return null;
      }

      // Get custom renderer if available
      const CustomRenderer = customRenderers?.[field.type];
      if (CustomRenderer) {
        return (
          <CustomRenderer
            key={field.name}
            field={field}
            value={formState.data[fieldName]}
            onChange={(value: unknown) => setValue(fieldName, value as TFormData[keyof TFormData])}
            onBlur={() => setTouched(fieldName)}
            error={errors[fieldName]}
            warning={warnings[fieldName]}
            disabled={readOnly || field.disabled}
            readOnly={readOnly || field.readOnly}
          />
        );
      }

      // Use default field renderer
      return (
        <FormField
          key={field.name}
          field={field}
          value={formState.data[fieldName]}
          onChange={(value: unknown) => setValue(fieldName, value as TFormData[keyof TFormData])}
          onBlur={() => setTouched(fieldName)}
          error={errors[fieldName]}
          warning={warnings[fieldName]}
          disabled={readOnly || field.disabled}
          readOnly={readOnly || field.readOnly}
        />
      );
    },
    [
      isFieldVisible,
      formState.data,
      setValue,
      setTouched,
      errors,
      warnings,
      customRenderers,
      readOnly,
    ]
  );

  /**
   * Render section
   */
  const renderSection = useCallback(
    (section: FormSection) => {
      // Check if section is visible
      if (section.showWhen) {
        const conditions = Array.isArray(section.showWhen)
          ? section.showWhen
          : [section.showWhen];
        // Simple visibility check - can be enhanced
        const isVisible = conditions.every(cond => {
          const fieldValue = formState.data[cond.field];
          return fieldValue === cond.value; // Simplified
        });
        if (!isVisible) return null;
      }

      return (
        <FormSectionComponent
          key={section.id}
          section={section}
          collapsible={section.collapsible}
          defaultCollapsed={section.defaultCollapsed}
        >
          <div className="space-y-4">
            {section.fields.map(renderField)}
          </div>
        </FormSectionComponent>
      );
    },
    [formState.data, renderField]
  );

  /**
   * Render form content
   */
  const formContent = useMemo(() => {
    if (schema.sections) {
      return schema.sections.map(renderSection);
    }

    if (schema.fields) {
      return (
        <div className="space-y-4">
          {schema.fields.map(renderField)}
        </div>
      );
    }

    return null;
  }, [schema, renderSection, renderField]);

  /**
   * Get submit button text
   */
  const submitButtonText = schema.submitText || 'Submit';
  const cancelButtonText = schema.cancelText || 'Cancel';

  return (
    <div
      className={cn(
        'dynamic-form-builder w-full',
        className
      )}
    >
      {/* Form Title */}
      {schema.title && (
        <div className="mb-6">
          <h2 className={cn('text-2xl font-semibold', theme.text.primary)}>
            {schema.title}
          </h2>
          {schema.description && (
            <p className={cn('mt-2 text-sm', theme.text.secondary)}>
              {schema.description}
            </p>
          )}
        </div>
      )}

      {/* Auto-save indicator */}
      {(config.enableAutoSave || schema.autoSave?.enabled) &&
        schema.autoSave?.showIndicator && (
          <div className="mb-4">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded text-sm',
                autoSave.isSaving && 'bg-blue-50 text-blue-700',
                autoSave.status === 'saved' && 'bg-green-50 text-green-700',
                autoSave.status === 'error' && 'bg-red-50 text-red-700'
              )}
            >
              {autoSave.isSaving && (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Saving...</span>
                </>
              )}
              {autoSave.status === 'saved' && (
                <>
                  <span>✓</span>
                  <span>
                    Saved{' '}
                    {autoSave.lastSaved &&
                      `at ${autoSave.lastSaved.toLocaleTimeString()}`}
                  </span>
                </>
              )}
              {autoSave.status === 'error' && (
                <>
                  <span>✕</span>
                  <span>Save failed: {autoSave.error}</span>
                </>
              )}
            </div>
          </div>
        )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading overlay */}
        {isLoading && (
          <div className="relative">
            <div style={{ backgroundColor: 'var(--color-surface)', opacity: 0.5 }} className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⟳</div>
                <p className={theme.text.secondary}>Loading...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form content */}
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          {formContent}
        </div>

        {/* Form actions */}
        {showActions && (
          <div
            className={cn(
              'flex items-center gap-3 pt-6 border-t',
              theme.border.default
            )}
          >
            <button
              type="submit"
              disabled={isLoading || isValidating || readOnly || !isValid}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium transition-colors',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
            >
              {isValidating ? 'Validating...' : submitButtonText}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-colors',
                  theme.surface.highlight,
                  theme.text.primary,
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                )}
              >
                {cancelButtonText}
              </button>
            )}

            {schema.showReset && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || !formState.isDirty}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-colors',
                  theme.text.secondary,
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'hover:text-red-600',
                  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                )}
              >
                Reset
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

DynamicFormBuilder.displayName = 'DynamicFormBuilder';
