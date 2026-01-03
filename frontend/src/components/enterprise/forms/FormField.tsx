/**
 * @module components/enterprise/forms/FormField
 * @category Enterprise - Forms
 * @description Universal form field component with full accessibility support
 *
 * FEATURES:
 * - Automatic field type rendering
 * - Full ARIA support
 * - Keyboard navigation
 * - Error/warning/info states
 * - Help text and tooltips
 * - Character count
 * - Required field indicators
 */

import React, { useId } from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
 
import type {
  FieldSchema,
  TextFieldSchema,
  NumberFieldSchema,
  DateFieldSchema,
  TextAreaFieldSchema,
  SelectFieldSchema,
  CheckboxFieldSchema,
  FileFieldSchema,
  CustomFieldSchema,
} from '@/types/forms';

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldProps {
  /** Field schema */
  field: FieldSchema;
  /** Current value */
  value: unknown;
  /** Change handler */
  onChange: (value: unknown) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Error message */
  error?: string;
  /** Warning message */
  warning?: string;
  /** Info message */
  info?: string;
  /** Is disabled */
  disabled?: boolean;
  /** Is read-only */
  readOnly?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  warning,
  info,
  disabled = false,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const inputId = useId();
  const errorId = useId();
  const helpId = useId();
  const descriptionId = useId();

  const {
    name,
    label,
    type,
    placeholder,
    helpText,
    required,
    autoFocus,
    tabIndex,
    ariaLabel,
    ariaDescription,
    className: fieldClassName,
    style: fieldStyle,
  } = field;

  // Combined disabled state
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;

  // ARIA attributes
  const ariaAttributes = {
    'aria-label': ariaLabel || label,
    'aria-describedby': [
      helpText ? helpId : null,
      ariaDescription ? descriptionId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
    'aria-invalid': error ? 'true' as const : undefined,
    'aria-required': required ? 'true' as const : undefined,
  };

  /**
   * Base input classes
   */
  const baseInputClasses = cn(
    'w-full px-3 py-2 rounded-lg border transition-all',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    error
      ? 'border-red-500 focus:ring-red-500'
      : warning
      ? 'border-yellow-500 focus:ring-yellow-500'
      : cn(theme.border.default, 'focus:ring-blue-500'),
    theme.surface.default,
    theme.text.primary,
    isDisabled && 'opacity-50 cursor-not-allowed bg-gray-100',
    isReadOnly && 'bg-gray-50 cursor-default',
    fieldClassName
  );

  /**
   * Type guard for text fields
   */
  const isTextField = (f: FieldSchema): f is TextFieldSchema => {
    return ['text', 'email', 'password', 'tel', 'url', 'search'].includes(f.type);
  };

  /**
   * Type guard for number fields
   */
  const isNumberField = (f: FieldSchema): f is NumberFieldSchema => {
    return ['number', 'range'].includes(f.type);
  };

  /**
   * Type guard for date fields
   */
  const isDateField = (f: FieldSchema): f is DateFieldSchema => {
    return ['date', 'datetime-local', 'time', 'month', 'week'].includes(f.type);
  };

  /**
   * Type guard for textarea fields
   */
  const isTextAreaField = (f: FieldSchema): f is TextAreaFieldSchema => {
    return f.type === 'textarea';
  };

  /**
   * Type guard for select fields
   */
  const isSelectField = (f: FieldSchema): f is SelectFieldSchema => {
    return ['select', 'multiselect', 'radio'].includes(f.type);
  };

  /**
   * Type guard for checkbox fields
   */
  const isCheckboxField = (f: FieldSchema): f is CheckboxFieldSchema => {
    return ['checkbox', 'toggle'].includes(f.type);
  };

  /**
   * Type guard for file fields
   */
  const isFileField = (f: FieldSchema): f is FileFieldSchema => {
    return f.type === 'file';
  };

  /**
   * Type guard for custom fields
   */
  const isCustomField = (f: FieldSchema): f is CustomFieldSchema => {
    return f.type === 'custom';
  };

  /**
   * Render field by type
   */
  const renderFieldInput = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'search': {
        if (!isTextField(field)) return null;
        const textField = field;
        return (
          <div>
            <input
              id={inputId}
              type={type}
              name={name}
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={required}
              autoFocus={autoFocus}
              tabIndex={tabIndex}
              minLength={textField.minLength}
              maxLength={textField.maxLength}
              pattern={textField.pattern?.source}
              autoComplete={textField.autoComplete}
              className={baseInputClasses}
              style={fieldStyle}
              {...ariaAttributes}
            />
            {textField.showCharCount && textField.maxLength && (
              <div className={cn('text-xs text-right mt-1', theme.text.secondary)}>
                {(value as string)?.length || 0} / {textField.maxLength}
              </div>
            )}
          </div>
        );
      }

      case 'number':
      case 'range': {
        if (!isNumberField(field)) return null;
        const numberField = field;
        return (
          <input
            id={inputId}
            type={type}
            name={name}
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            min={numberField.min}
            max={numberField.max}
            step={numberField.step}
            className={baseInputClasses}
            style={fieldStyle}
            {...ariaAttributes}
          />
        );
      }

      case 'date':
      case 'datetime-local':
      case 'time':
      case 'month':
      case 'week': {
        if (!isDateField(field)) return null;
        const dateField = field;
        const minValue = typeof dateField.min === 'string' ? dateField.min : dateField.min?.toISOString().split('T')[0];
        const maxValue = typeof dateField.max === 'string' ? dateField.max : dateField.max?.toISOString().split('T')[0];
        return (
          <input
            id={inputId}
            type={type}
            name={name}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            min={minValue}
            max={maxValue}
            className={baseInputClasses}
            style={fieldStyle}
            {...ariaAttributes}
          />
        );
      }

      case 'textarea': {
        if (!isTextAreaField(field)) return null;
        const textAreaField = field;
        return (
          <textarea
            id={inputId}
            name={name}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            rows={textAreaField.rows || 4}
            className={cn(baseInputClasses, 'resize-y')}
            style={{
              ...fieldStyle,
              minHeight: textAreaField.minHeight,
              maxHeight: textAreaField.maxHeight,
            }}
            {...ariaAttributes}
          />
        );
      }

      case 'select': {
        if (!isSelectField(field)) return null;
        const selectField = field;
        const options = Array.isArray(selectField.options)
          ? selectField.options
          : [];

        return (
          <select
            id={inputId}
            name={name}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isDisabled}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            className={baseInputClasses}
            style={fieldStyle}
            {...ariaAttributes}
          >
            {!required && <option value="">Select...</option>}
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      case 'checkbox':
      case 'toggle': {
        if (!isCheckboxField(field)) return null;
        const checkboxField = field;
        return (
          <label
            className="flex items-center gap-2 cursor-pointer"
            htmlFor={inputId}
          >
            {checkboxField.labelPosition === 'left' && (
              <span className={theme.text.primary}>{label}</span>
            )}
            <input
              id={inputId}
              type="checkbox"
              name={name}
              checked={(value as boolean) || false}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={isDisabled}
              required={required}
              autoFocus={autoFocus}
              tabIndex={tabIndex}
              className={cn(
                'w-4 h-4 rounded',
                'border-2',
                'focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              {...ariaAttributes}
            />
            {(!checkboxField.labelPosition || checkboxField.labelPosition === 'right') && (
              <span className={theme.text.primary}>{label}</span>
            )}
          </label>
        );
      }

      case 'radio': {
        if (!isSelectField(field)) return null;
        const radioField = field;
        const options = Array.isArray(radioField.options) ? radioField.options : [];

        return (
          <div
            role="radiogroup"
            aria-label={ariaLabel || label}
            className="space-y-2"
          >
            {options.map((option, index) => (
              <label
                key={String(option.value)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={name}
                  value={String(option.value)}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={isDisabled || option.disabled}
                  required={required}
                  autoFocus={autoFocus && index === 0}
                  tabIndex={tabIndex}
                  className={cn(
                    'w-4 h-4',
                    'focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                    (isDisabled || option.disabled) && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <span className={theme.text.primary}>{option.label}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'file': {
        if (!isFileField(field)) return null;
        const fileField = field;
        return (
          <input
            id={inputId}
            type="file"
            name={name}
            onChange={(e) => {
              const files = e.target.files;
              onChange(fileField.multiple ? Array.from(files || []) : files?.[0]);
            }}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isDisabled}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            accept={fileField.accept}
            multiple={fileField.multiple}
            className={cn(
              'block w-full text-sm',
              theme.text.primary,
              'file:mr-4 file:py-2 file:px-4',
              'file:rounded-lg file:border-0',
              'file:text-sm file:font-semibold',
              'file:bg-blue-50 file:text-blue-700',
              'hover:file:bg-blue-100',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            style={fieldStyle}
            {...ariaAttributes}
          />
        );
      }

      case 'color': {
        return (
          <input
            id={inputId}
            type="color"
            name={name}
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isDisabled}
            required={required}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            className={cn('h-10 w-20 rounded cursor-pointer', isDisabled && 'opacity-50')}
            style={fieldStyle}
            {...ariaAttributes}
          />
        );
      }

      case 'custom': {
        if (!isCustomField(field)) return null;
        const customField = field;
        const CustomComponent = customField.component;
        return (
          <CustomComponent
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isDisabled}
            readOnly={isReadOnly}
            error={error}
            name={name}
            label={label}
            {...customField.componentProps}
            {...ariaAttributes}
          />
        );
      }

      default:
        return (
          <div className={cn('p-4 rounded-lg', 'bg-yellow-50 text-yellow-800')}>
            Unsupported field type: {type}
          </div>
        );
    }
  };

  // Don't render label separately for checkbox/toggle/radio
  const showSeparateLabel = !['checkbox', 'toggle', 'radio'].includes(type);

  return (
    <div className={cn('form-field', field.order ? `order-${field.order}` : undefined)}>
      {/* Label */}
      {showSeparateLabel && label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1.5',
            theme.text.primary,
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </label>
      )}

      {/* Field Input */}
      {renderFieldInput()}

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className={cn('text-xs mt-1', theme.text.secondary)}>
          {helpText}
        </p>
      )}

      {/* ARIA Description */}
      {ariaDescription && (
        <p id={descriptionId} className="sr-only">
          {ariaDescription}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 mt-1 flex items-center gap-1"
        >
          <span aria-hidden="true">✕</span>
          {error}
        </p>
      )}

      {/* Warning Message */}
      {!error && warning && (
        <p
          role="status"
          className="text-xs text-yellow-600 mt-1 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {warning}
        </p>
      )}

      {/* Info Message */}
      {!error && !warning && info && (
        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
          <span aria-hidden="true">ℹ</span>
          {info}
        </p>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';
