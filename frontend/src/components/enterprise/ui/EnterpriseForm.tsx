/**
 * @module enterprise/ui/EnterpriseForm
 * @category Enterprise UI
 * @description Advanced form component with validation, auto-save, and field dependencies
 *
 * Features:
 * - Complex form layouts (grid, sections)
 * - Real-time validation with visual feedback
 * - Auto-save with debouncing
 * - Field dependencies and conditional rendering
 * - Form state management
 * - Accessibility features
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Info,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'min' | 'max' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>;
}

export interface FieldDependency {
  field: string;
  condition: (value: any) => boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
  dependencies?: FieldDependency[];
  options?: Array<{ label: string; value: any }>;
  disabled?: boolean;
  readOnly?: boolean;
  helpText?: string;
  className?: string;
  rows?: number; // For textarea
  accept?: string; // For file input
  multiple?: boolean; // For file/select
  autoComplete?: string;
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: FormField[];
  columns?: 1 | 2 | 3 | 4;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface EnterpriseFormProps {
  sections: FormSection[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onChange?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onAutoSave?: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  showResetButton?: boolean;
  className?: string;
  loading?: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const validateField = async (
  field: FormField,
  value: any,
  formData: Record<string, any>
): Promise<string | null> => {
  if (!field.validation) return null;

  for (const rule of field.validation) {
    let isValid = true;
    let message = rule.message || 'Invalid value';

    switch (rule.type) {
      case 'required':
        isValid = value !== null && value !== undefined && value !== '';
        message = rule.message || `${field.label} is required`;
        break;

      case 'minLength':
        isValid = String(value).length >= (rule.value || 0);
        message = rule.message || `${field.label} must be at least ${rule.value} characters`;
        break;

      case 'maxLength':
        isValid = String(value).length <= (rule.value || Infinity);
        message = rule.message || `${field.label} must be at most ${rule.value} characters`;
        break;

      case 'pattern':
        isValid = new RegExp(rule.value).test(String(value));
        message = rule.message || `${field.label} format is invalid`;
        break;

      case 'email':
        isValid = /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(String(value));
        message = rule.message || 'Invalid email address';
        break;

      case 'min':
        isValid = Number(value) >= (rule.value || 0);
        message = rule.message || `${field.label} must be at least ${rule.value}`;
        break;

      case 'max':
        isValid = Number(value) <= (rule.value || Infinity);
        message = rule.message || `${field.label} must be at most ${rule.value}`;
        break;

      case 'custom':
        if (rule.validator) {
          isValid = await rule.validator(value, formData);
        }
        break;
    }

    if (!isValid) {
      return message;
    }
  }

  return null;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  sections,
  onSubmit,
  onChange,
  initialData = {},
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  showResetButton = false,
  className,
  loading = false,
}) => {
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLFormElement>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize expanded sections
    const initialExpanded: Record<number, boolean> = {};
    sections.forEach((section, idx) => {
      initialExpanded[idx] = section.defaultExpanded ?? true;
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

  // ============================================================================
  // AUTO-SAVE
  // ============================================================================

  useEffect(() => {
    if (!autoSave || !onAutoSave) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      if (Object.keys(touched).length === 0) return;

      setIsSaving(true);
      try {
        await onAutoSave(formData);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, autoSave, autoSaveDelay, onAutoSave, touched]);

  // ============================================================================
  // FIELD VISIBILITY
  // ============================================================================

  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.dependencies) return true;

      return field.dependencies.every((dep) => {
        const depValue = formData[dep.field];
        return dep.condition(depValue);
      });
    },
    [formData]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback(
    async (fieldName: string, value: any) => {
      const newFormData = { ...formData, [fieldName]: value };
      setFormData(newFormData);
      setTouched({ ...touched, [fieldName]: true });

      // Find field definition
      const field = sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === fieldName);

      if (field) {
        const error = await validateField(field, value, newFormData);
        setErrors({ ...errors, [fieldName]: error || '' });
      }

      onChange?.(newFormData);
    },
    [formData, touched, errors, sections, onChange]
  );

  const handleBlur = useCallback(
    async (fieldName: string) => {
      setTouched({ ...touched, [fieldName]: true });

      const field = sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === fieldName);

      if (field) {
        const error = await validateField(field, formData[fieldName], formData);
        setErrors({ ...errors, [fieldName]: error || '' });
      }
    },
    [formData, touched, errors, sections]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const allFields = sections.flatMap((s) => s.fields);
      const newErrors: Record<string, string> = {};
      let hasErrors = false;

      for (const field of allFields) {
        if (isFieldVisible(field)) {
          const error = await validateField(field, formData[field.name], formData);
          if (error) {
            newErrors[field.name] = error;
            hasErrors = true;
          }
        }
      }

      setErrors(newErrors);

      if (hasErrors) {
        // Mark all fields as touched
        const allTouched: Record<string, boolean> = {};
        allFields.forEach((f) => {
          allTouched[f.name] = true;
        });
        setTouched(allTouched);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [sections, formData, onSubmit, isFieldVisible]
  );

  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    onChange?.(initialData);
  }, [initialData, onChange]);

  const toggleSection = useCallback((index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  // ============================================================================
  // RENDER FIELD
  // ============================================================================

  const renderField = useCallback(
    (field: FormField) => {
      if (!isFieldVisible(field)) return null;

      const value = formData[field.name] ?? field.defaultValue ?? '';
      const error = touched[field.name] ? errors[field.name] : '';
      const hasError = !!error;

      const fieldId = `field-${field.name}`;
      const commonProps = {
        id: fieldId,
        name: field.name,
        disabled: field.disabled || loading,
        readOnly: field.readOnly,
        className: cn(
          'w-full',
          hasError && 'border-rose-500 focus:ring-rose-500',
          field.className
        ),
        onBlur: () => handleBlur(field.name),
      };

      let fieldElement: React.ReactNode;

      switch (field.type) {
        case 'textarea':
          fieldElement = (
            <textarea
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={cn(
                'px-4 py-2 rounded-lg border transition-colors resize-vertical',
                theme.surface.default,
                theme.border.default,
                theme.text.primary,
                hasError
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                  : 'focus:ring-2 focus:ring-blue-500',
                commonProps.className
              )}
            />
          );
          break;

        case 'select':
          fieldElement = (
            <select
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              multiple={field.multiple}
              className={cn(
                'px-4 py-2 rounded-lg border transition-colors',
                theme.surface.default,
                theme.border.default,
                theme.text.primary,
                hasError
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                  : 'focus:ring-2 focus:ring-blue-500',
                commonProps.className
              )}
            >
              {field.placeholder && (
                <option value="">{field.placeholder}</option>
              )}
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
          break;

        case 'checkbox':
          fieldElement = (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...commonProps}
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className={cn('text-sm', theme.text.primary)}>{field.label}</span>
            </label>
          );
          break;

        case 'radio':
          fieldElement = (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={field.disabled || loading}
                    className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={cn('text-sm', theme.text.primary)}>{option.label}</span>
                </label>
              ))}
            </div>
          );
          break;

        case 'file':
          fieldElement = (
            <input
              type="file"
              {...commonProps}
              onChange={(e) => handleFieldChange(field.name, e.target.files)}
              accept={field.accept}
              multiple={field.multiple}
              className={cn(
                'block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100',
                theme.text.primary,
                commonProps.className
              )}
            />
          );
          break;

        case 'password':
          fieldElement = (
            <div className="relative">
              <Input
                {...commonProps}
                type={showPassword[field.name] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({ ...showPassword, [field.name]: !showPassword[field.name] })
                }
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800',
                  theme.text.tertiary
                )}
              >
                {showPassword[field.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          );
          break;

        default:
          fieldElement = (
            <Input
              {...commonProps}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
            />
          );
      }

      // Don't show label for checkbox (it's inline)
      if (field.type === 'checkbox') {
        return (
          <div key={field.name} className="py-2">
            {fieldElement}
            {field.helpText && (
              <p className={cn('mt-1 text-xs flex items-center gap-1', theme.text.tertiary)}>
                <Info className="h-3 w-3" />
                {field.helpText}
              </p>
            )}
            <AnimatePresence>
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        );
      }

      return (
        <div key={field.name}>
          <label htmlFor={fieldId} className={cn('block text-sm font-medium mb-2', theme.text.primary)}>
            {field.label}
            {field.validation?.some((v) => v.type === 'required') && (
              <span className="text-rose-500 ml-1">*</span>
            )}
          </label>
          {fieldElement}
          {field.helpText && (
            <p className={cn('mt-1 text-xs flex items-center gap-1', theme.text.tertiary)}>
              <Info className="h-3 w-3" />
              {field.helpText}
            </p>
          )}
          <AnimatePresence>
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    },
    [formData, errors, touched, loading, handleFieldChange, handleBlur, isFieldVisible, showPassword, theme]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Auto-save indicator */}
      {autoSave && (
        <div className={cn('flex items-center justify-between text-xs', theme.text.tertiary)}>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Last saved at {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Sections */}
      {sections.map((section, sectionIdx) => {
        const isExpanded = expandedSections[sectionIdx];

        return (
          <div
            key={sectionIdx}
            className={cn(
              'rounded-lg border p-6',
              theme.surface.default,
              theme.border.default
            )}
          >
            {(section.title || section.description) && (
              <div className="mb-6">
                {section.title && (
                  <button
                    type="button"
                    onClick={() => section.collapsible && toggleSection(sectionIdx)}
                    className={cn(
                      'flex items-center justify-between w-full text-left',
                      section.collapsible && 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400'
                    )}
                  >
                    <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                      {section.title}
                    </h3>
                    {section.collapsible && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.div>
                    )}
                  </button>
                )}
                {section.description && (
                  <p className={cn('mt-1 text-sm', theme.text.secondary)}>
                    {section.description}
                  </p>
                )}
              </div>
            )}

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      'grid gap-6',
                      section.columns === 2 && 'md:grid-cols-2',
                      section.columns === 3 && 'md:grid-cols-3',
                      section.columns === 4 && 'md:grid-cols-4'
                    )}
                  >
                    {section.fields.map(renderField)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {showResetButton && (
          <Button type="button" variant="outline" onClick={handleReset} disabled={loading || isSubmitting}>
            Reset
          </Button>
        )}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading || isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={loading}
          icon={Save}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

EnterpriseForm.displayName = 'EnterpriseForm';
export default EnterpriseForm;