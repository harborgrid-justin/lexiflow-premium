/**
 * @module types/forms
 * @category Types - Forms
 * @description Comprehensive type definitions for enterprise form system
 *
 * FEATURES:
 * - Schema-driven form definitions
 * - Advanced validation types
 * - Multi-step wizard types
 * - Dynamic form generation
 * - Accessibility annotations
 */

// ============================================================================
// FIELD TYPES
// ============================================================================

/**
 * Supported field types for dynamic form generation
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'color'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'file'
  | 'range'
  | 'custom';

/**
 * Field visibility conditions
 */
export type FieldCondition<TFormData = Record<string, unknown>> = {
  /** Field to watch */
  field: keyof TFormData;
  /** Comparison operator */
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  /** Value to compare against */
  value?: unknown;
};

/**
 * Field size variants
 */
export type FieldSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Field layout
 */
export type FieldLayout = 'vertical' | 'horizontal' | 'inline';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation result
 */
export interface ValidationResult {
  /** Is field valid */
  valid: boolean;
  /** Error/warning/info message */
  message?: string;
  /** Severity level */
  severity?: ValidationSeverity;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Async validation function
 */
export type AsyncValidator<T = unknown> = (
  value: T,
  formData?: Record<string, unknown>
) => Promise<ValidationResult>;

/**
 * Sync validation function
 */
export type SyncValidator<T = unknown> = (
  value: T,
  formData?: Record<string, unknown>
) => ValidationResult;

/**
 * Combined validator type
 */
export type Validator<T = unknown> = SyncValidator<T> | AsyncValidator<T>;

/**
 * Validation rule with metadata
 */
export interface ValidationRule<T = unknown> {
  /** Rule name/identifier */
  name: string;
  /** Validation function */
  validator: Validator<T>;
  /** Debounce delay in ms (async only) */
  debounce?: number;
  /** Only validate when field is touched */
  validateOnTouch?: boolean;
  /** Only validate when field is blurred */
  validateOnBlur?: boolean;
  /** Custom error message override */
  message?: string;
  /** Validation depends on other fields */
  dependencies?: string[];
}

/**
 * Cross-field validation rule
 */
export interface CrossFieldValidationRule<TFormData = Record<string, unknown>> {
  /** Rule name */
  name: string;
  /** Fields involved in validation */
  fields: Array<keyof TFormData>;
  /** Validation function */
  validator: (formData: TFormData) => ValidationResult | Promise<ValidationResult>;
  /** Error message */
  message?: string;
}

// ============================================================================
// FIELD SCHEMA
// ============================================================================

/**
 * Base field configuration
 */
export interface BaseFieldSchema<T = unknown> {
  /** Field name (must match form data key) */
  name: string;
  /** Field label */
  label: string;
  /** Field type */
  type: FieldType;
  /** Default value */
  defaultValue?: T;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Is field required */
  required?: boolean;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field read-only */
  readOnly?: boolean;
  /** Field size */
  size?: FieldSize;
  /** Validation rules */
  validationRules?: ValidationRule<T>[];
  /** Conditional visibility */
  showWhen?: FieldCondition | FieldCondition[];
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Tab index */
  tabIndex?: number;
  /** ARIA label (if different from label) */
  ariaLabel?: string;
  /** ARIA description */
  ariaDescription?: string;
  /** Custom CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Field order/position */
  order?: number;
}

/**
 * Text input field schema
 */
export interface TextFieldSchema extends BaseFieldSchema<string> {
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Min length */
  minLength?: number;
  /** Max length */
  maxLength?: number;
  /** Pattern regex */
  pattern?: RegExp;
  /** Input mask */
  mask?: string;
  /** Auto-complete type */
  autoComplete?: string;
  /** Show character count */
  showCharCount?: boolean;
}

/**
 * Number input field schema
 */
export interface NumberFieldSchema extends BaseFieldSchema<number> {
  type: 'number' | 'range';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Number format (e.g., currency) */
  format?: 'currency' | 'percent' | 'decimal';
  /** Decimal places */
  precision?: number;
  /** Currency code (if format is currency) */
  currency?: string;
}

/**
 * Date/time field schema
 */
export interface DateFieldSchema extends BaseFieldSchema<string | Date> {
  type: 'date' | 'datetime-local' | 'time' | 'month' | 'week';
  /** Minimum date */
  min?: string | Date;
  /** Maximum date */
  max?: string | Date;
  /** Date format */
  format?: string;
  /** Show time picker */
  showTimePicker?: boolean;
}

/**
 * Color field schema
 */
export interface ColorFieldSchema extends BaseFieldSchema<string> {
  type: 'color';
}

/**
 * Select option
 */
export interface SelectOption<T = string> {
  /** Option value */
  value: T;
  /** Display label */
  label: string;
  /** Is option disabled */
  disabled?: boolean;
  /** Option group */
  group?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Select field schema
 */
export interface SelectFieldSchema<T = string> extends BaseFieldSchema<T> {
  type: 'select' | 'multiselect' | 'radio';
  /** Available options */
  options: SelectOption<T>[] | (() => Promise<SelectOption<T>[]>);
  /** Allow custom values (combobox) */
  allowCustom?: boolean;
  /** Show search */
  searchable?: boolean;
  /** Enable virtualization for large lists */
  virtualized?: boolean;
  /** Load options on demand */
  loadOptions?: (query: string) => Promise<SelectOption<T>[]>;
  /** Maximum selections (multiselect only) */
  maxSelections?: number;
}

/**
 * Textarea field schema
 */
export interface TextAreaFieldSchema extends BaseFieldSchema<string> {
  type: 'textarea';
  /** Number of rows */
  rows?: number;
  /** Auto-resize */
  autoResize?: boolean;
  /** Min height (px) */
  minHeight?: number;
  /** Max height (px) */
  maxHeight?: number;
  /** Rich text editor */
  richText?: boolean;
  /** Max length */
  maxLength?: number;
  /** Show character count */
  showCharCount?: boolean;
}

/**
 * Checkbox/toggle field schema
 */
export interface CheckboxFieldSchema extends BaseFieldSchema<boolean> {
  type: 'checkbox' | 'toggle';
  /** Label position */
  labelPosition?: 'left' | 'right';
}

/**
 * File upload field schema
 */
export interface FileFieldSchema extends BaseFieldSchema<File | File[]> {
  type: 'file';
  /** Accepted file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Max file size (bytes) */
  maxSize?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Show preview */
  showPreview?: boolean;
  /** Upload handler */
  uploadHandler?: (files: File[]) => Promise<string[]>;
}

/**
 * Custom field schema
 */
export interface CustomFieldSchema extends BaseFieldSchema<unknown> {
  type: 'custom';
  /** Custom component */
  component: React.ComponentType<CustomFieldProps>;
  /** Additional props for custom component */
  componentProps?: Record<string, unknown>;
}

/**
 * Props for custom field components
 */
export interface CustomFieldProps {
  /** Field value */
  value: unknown;
  /** Change handler */
  onChange: (value: unknown) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field read-only */
  readOnly?: boolean;
  /** Error message */
  error?: string;
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Additional props */
  [key: string]: unknown;
}

/**
 * Union of all field schema types
 */
export type FieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | DateFieldSchema
  | ColorFieldSchema
  | SelectFieldSchema
  | TextAreaFieldSchema
  | CheckboxFieldSchema
  | FileFieldSchema
  | CustomFieldSchema;

// ============================================================================
// FORM SCHEMA
// ============================================================================

/**
 * Form section/fieldset
 */
export interface FormSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Fields in this section */
  fields: FieldSchema[];
  /** Collapsible section */
  collapsible?: boolean;
  /** Initially collapsed */
  defaultCollapsed?: boolean;
  /** Conditional visibility */
  showWhen?: FieldCondition | FieldCondition[];
}

/**
 * Complete form schema
 */
export interface FormSchema<TFormData = Record<string, unknown>> {
  /** Form identifier */
  id: string;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Form sections */
  sections?: FormSection[];
  /** Flat field list (if not using sections) */
  fields?: FieldSchema[];
  /** Cross-field validation rules */
  crossFieldValidations?: CrossFieldValidationRule<TFormData>[];
  /** Form layout */
  layout?: FieldLayout;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Show reset button */
  showReset?: boolean;
  /** Auto-save configuration */
  autoSave?: AutoSaveConfig;
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  /** Enable auto-save */
  enabled: boolean;
  /** Debounce delay (ms) */
  delay?: number;
  /** Save handler */
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Show save indicator */
  showIndicator?: boolean;
}

// ============================================================================
// MULTI-STEP WIZARD
// ============================================================================

/**
 * Wizard step configuration
 */
export interface WizardStep<TFormData = Record<string, unknown>> {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon */
  icon?: React.ReactNode;
  /** Fields in this step */
  fields?: FieldSchema[];
  /** Sections in this step */
  sections?: FormSection[];
  /** Custom component for step */
  component?: React.ComponentType<WizardStepProps<TFormData>>;
  /** Validation rules for this step */
  validationRules?: CrossFieldValidationRule<TFormData>[];
  /** Skip condition */
  skipWhen?: FieldCondition<TFormData> | FieldCondition<TFormData>[];
  /** Can navigate away without validation */
  allowIncomplete?: boolean;
  /** Custom next button text */
  nextButtonText?: string;
  /** Custom back button text */
  backButtonText?: string;
  /** Hide step from progress indicator */
  hidden?: boolean;
}

/**
 * Props for wizard step components
 */
export interface WizardStepProps<TFormData = Record<string, unknown>> {
  /** Current form data */
  data: TFormData;
  /** Update form data */
  updateData: (updates: Partial<TFormData>) => void;
  /** Validation errors */
  errors: Record<string, string>;
  /** Go to next step */
  goNext: () => void;
  /** Go to previous step */
  goBack: () => void;
  /** Is first step */
  isFirst: boolean;
  /** Is last step */
  isLast: boolean;
}

/**
 * Wizard configuration
 */
export interface WizardConfig<TFormData = Record<string, unknown>> {
  /** Wizard identifier */
  id: string;
  /** Wizard title */
  title?: string;
  /** Wizard description */
  description?: string;
  /** Wizard steps */
  steps: WizardStep<TFormData>[];
  /** Show progress indicator */
  showProgress?: boolean;
  /** Progress indicator type */
  progressType?: 'dots' | 'bar' | 'steps';
  /** Allow step navigation */
  allowStepNavigation?: boolean;
  /** Persist data between sessions */
  persistData?: boolean;
  /** Storage key for persisted data */
  storageKey?: string;
  /** Auto-save configuration */
  autoSave?: AutoSaveConfig;
  /** Submit handler */
  onSubmit?: (data: TFormData) => Promise<void>;
  /** Cancel handler */
  onCancel?: () => void;
}

// ============================================================================
// FORM STATE
// ============================================================================

/**
 * Field state
 */
export interface FieldState {
  /** Field value */
  value: unknown;
  /** Has been touched */
  touched: boolean;
  /** Has been modified */
  dirty: boolean;
  /** Validation error */
  error: string | null;
  /** Validation warning */
  warning: string | null;
  /** Is validating */
  validating: boolean;
  /** Is disabled */
  disabled: boolean;
  /** Is visible */
  visible: boolean;
}

/**
 * Form state
 */
export interface FormState<TFormData = Record<string, unknown>> {
  /** Form data */
  data: TFormData;
  /** Field states */
  fields: Record<keyof TFormData, FieldState>;
  /** Is form valid */
  isValid: boolean;
  /** Is form submitting */
  isSubmitting: boolean;
  /** Is form dirty (has changes) */
  isDirty: boolean;
  /** Submit count */
  submitCount: number;
  /** Form-level errors */
  errors: Record<string, string>;
}

// ============================================================================
// FORM HANDLERS
// ============================================================================

/**
 * Form event handlers
 */
export interface FormHandlers<TFormData = Record<string, unknown>> {
  /** Handle field change */
  handleChange: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  /** Handle field blur */
  handleBlur: <K extends keyof TFormData>(field: K) => void;
  /** Handle field focus */
  handleFocus: <K extends keyof TFormData>(field: K) => void;
  /** Handle form submit */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  /** Handle form reset */
  handleReset: () => void;
  /** Validate specific field */
  validateField: <K extends keyof TFormData>(field: K) => Promise<boolean>;
  /** Validate all fields */
  validateAll: () => Promise<boolean>;
  /** Set field value */
  setFieldValue: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  /** Set multiple field values */
  setFieldValues: (values: Partial<TFormData>) => void;
  /** Set field error */
  setFieldError: <K extends keyof TFormData>(field: K, error: string | null) => void;
  /** Set field touched */
  setFieldTouched: <K extends keyof TFormData>(field: K, touched?: boolean) => void;
}

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

/**
 * Form configuration options
 */
export interface FormConfig<TFormData = Record<string, unknown>> {
  /** Form schema */
  schema: FormSchema<TFormData>;
  /** Initial values */
  initialValues: TFormData;
  /** Submit handler */
  onSubmit: (values: TFormData) => Promise<void> | void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Validation mode */
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  /** Re-validate mode */
  revalidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  /** Enable auto-save */
  enableAutoSave?: boolean;
  /** Auto-save delay */
  autoSaveDelay?: number;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Re-export for convenience
  ValidationRule as FieldValidationRule,
};
