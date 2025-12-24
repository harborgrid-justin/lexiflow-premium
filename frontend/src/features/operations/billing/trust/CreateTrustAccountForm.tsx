/**
 * Create Trust Account Form Component
 * 
 * ARCHITECTURAL PHILOSOPHY:
 * - **Multi-Step Pattern**: Complex forms broken into logical steps
 * - **Progressive Disclosure**: Show fields relevant to current step
 * - **Real-Time Validation**: Validate on blur with immediate feedback
 * - **Type Safety**: Form state fully typed with no implicit any
 * - **Compliance Enforcement**: Pre-validate state bar requirements
 * 
 * WHY THIS DESIGN:
 * 1. Multi-step reduces cognitive load and form abandonment
 * 2. Step validation prevents advancing with invalid data
 * 3. Progress indicator provides clear completion status
 * 4. Compliance checks run before submission (fail fast)
 * 5. Controlled components ensure React owns state (single source of truth)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle, Landmark, Building, Shield, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../../../common/Card';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useCreateTrustAccount, useTrustAccountValidation } from '@/hooks/useTrustAccounts';
import type { CreateTrustAccountDto, TrustAccountType, TrustAccountStatus } from '../../../../types/trust-accounts';
import { TrustAccountType as AccountType } from '../../../../types/trust-accounts';

/**
 * Form Steps Enum
 * WHY: Type-safe step navigation prevents invalid states
 */
enum FormStep {
  ACCOUNT_INFO = 0,
  BANK_DETAILS = 1,
  COMPLIANCE = 2,
  SIGNATORIES = 3,
  REVIEW = 4,
}

/**
 * Form State Interface
 * WHY: Explicit typing prevents runtime errors and enables autocomplete
 */
interface FormState extends Partial<CreateTrustAccountDto> {
  // Extended fields not in DTO
  jurisdiction?: string;
  stateBarApproved?: boolean;
  overdraftReportingEnabled?: boolean;
  clientConsentForLocation?: boolean;
  recordRetentionYears?: number;
  authorizedSignatories?: string[];
  primarySignatory?: string;
}

/**
 * Field Validation Error Type
 */
interface FieldError {
  field: keyof FormState;
  message: string;
}

/**
 * Step Validation Result
 */
interface StepValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

/**
 * Props Interface
 */
interface CreateTrustAccountFormProps {
  onSuccess?: (accountId: string) => void;
  onCancel?: () => void;
}

export const CreateTrustAccountForm: React.FC<CreateTrustAccountFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { createAccount, isCreating, error: apiError } = useCreateTrustAccount();
  const { validateAccountTitle } = useTrustAccountValidation();

  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.ACCOUNT_INFO);
  const [formData, setFormData] = useState<FormState>({
    accountType: AccountType.IOLTA,
    status: 'active' as TrustAccountStatus,
    interestBearing: true,
    currency: 'USD',
    recordRetentionYears: 7,
    authorizedSignatories: [],
  });
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [validationErrors, setValidationErrors] = useState<FieldError[]>([]);

  /**
   * VALIDATION LOGIC: Step-specific validation
   * WHY: Each step has unique validation requirements
   */
  const validateStep = useCallback((step: FormStep, data: FormState): StepValidationResult => {
    const errors: FieldError[] = [];

    switch (step) {
      case FormStep.ACCOUNT_INFO:
        if (!data.accountNumber?.trim()) {
          errors.push({ field: 'accountNumber', message: 'Account number is required' });
        }
        if (!data.accountName?.trim()) {
          errors.push({ field: 'accountName', message: 'Account name is required' });
        } else if (!validateAccountTitle(data.accountName)) {
          errors.push({
            field: 'accountName',
            message: 'Account name must include "Trust Account" or "Escrow Account"',
          });
        }
        if (!data.clientId?.trim()) {
          errors.push({ field: 'clientId', message: 'Client is required' });
        }
        if (!data.clientName?.trim()) {
          errors.push({ field: 'clientName', message: 'Client name is required' });
        }
        break;

      case FormStep.BANK_DETAILS:
        if (!data.bankName?.trim()) {
          errors.push({ field: 'bankName', message: 'Bank name is required' });
        }
        if (!data.bankAccountNumber?.trim()) {
          errors.push({ field: 'bankAccountNumber', message: 'Bank account number is required' });
        }
        if (!data.routingNumber?.trim()) {
          errors.push({ field: 'routingNumber', message: 'Routing number is required' });
        } else if (!/^\d{9}$/.test(data.routingNumber)) {
          errors.push({ field: 'routingNumber', message: 'Routing number must be 9 digits' });
        }
        break;

      case FormStep.COMPLIANCE:
        if (!data.jurisdiction?.trim()) {
          errors.push({ field: 'jurisdiction', message: 'Jurisdiction is required' });
        }
        if (data.stateBarApproved === undefined) {
          errors.push({ field: 'stateBarApproved', message: 'State bar approval status is required' });
        }
        if (data.accountType === AccountType.IOLTA && !data.ioltalProgramId?.trim()) {
          errors.push({ field: 'ioltalProgramId', message: 'IOLTA program ID is required for IOLTA accounts' });
        }
        break;

      case FormStep.SIGNATORIES:
        if (!data.authorizedSignatories || data.authorizedSignatories.length === 0) {
          errors.push({ field: 'authorizedSignatories', message: 'At least one authorized signatory is required' });
        }
        if (!data.primarySignatory?.trim()) {
          errors.push({ field: 'primarySignatory', message: 'Primary signatory is required' });
        }
        break;

      case FormStep.REVIEW:
        // Final validation - all previous steps must be valid
        const step1Validation = validateStep(FormStep.ACCOUNT_INFO, data);
        const step2Validation = validateStep(FormStep.BANK_DETAILS, data);
        const step3Validation = validateStep(FormStep.COMPLIANCE, data);
        const step4Validation = validateStep(FormStep.SIGNATORIES, data);
        errors.push(
          ...step1Validation.errors,
          ...step2Validation.errors,
          ...step3Validation.errors,
          ...step4Validation.errors
        );
        break;
    }

    return { isValid: errors.length === 0, errors };
  }, [validateAccountTitle]);

  /**
   * FORM FIELD UPDATER: Type-safe field updates
   * WHY: Generic handler prevents duplication and maintains type safety
   */
  const updateField = useCallback(<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  /**
   * FIELD BLUR HANDLER: Validate on blur
   * WHY: Immediate feedback without overwhelming user during typing
   */
  const handleFieldBlur = useCallback((field: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(field));
    const validation = validateStep(currentStep, formData);
    setValidationErrors(validation.errors);
  }, [currentStep, formData, validateStep]);

  /**
   * STEP NAVIGATION: Validate before advancing
   */
  const handleNext = useCallback(() => {
    const validation = validateStep(currentStep, formData);
    setValidationErrors(validation.errors);

    if (validation.isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, FormStep.REVIEW));
    }
  }, [currentStep, formData, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, FormStep.ACCOUNT_INFO));
  }, []);

  /**
   * FORM SUBMISSION: Create account with full validation
   */
  const handleSubmit = useCallback(async () => {
    const validation = validateStep(FormStep.REVIEW, formData);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    try {
      const dto: CreateTrustAccountDto = {
        accountNumber: formData.accountNumber!,
        accountName: formData.accountName!,
        accountType: formData.accountType!,
        clientId: formData.clientId!,
        clientName: formData.clientName!,
        caseId: formData.caseId,
        balance: formData.balance || 0,
        currency: formData.currency || 'USD',
        status: formData.status,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        routingNumber: formData.routingNumber,
        purpose: formData.purpose,
        openedDate: formData.openedDate,
        minimumBalance: formData.minimumBalance,
        interestBearing: formData.interestBearing ?? true,
        notes: formData.notes,
        responsibleAttorney: formData.responsibleAttorney,
      };

      const account = await createAccount(dto);
      onSuccess?.(account.id);
    } catch (err) {
      console.error('Failed to create trust account:', err);
    }
  }, [formData, validateStep, createAccount, onSuccess]);

  /**
   * HELPER: Get field error
   */
  const getFieldError = useCallback((field: keyof FormState): string | undefined => {
    if (!touched.has(field)) return undefined;
    return validationErrors.find((e) => e.field === field)?.message;
  }, [touched, validationErrors]);

  /**
   * STEP INDICATORS: Visual progress
   */
  const steps = useMemo(() => [
    { id: FormStep.ACCOUNT_INFO, label: 'Account Info', icon: Landmark },
    { id: FormStep.BANK_DETAILS, label: 'Bank Details', icon: Building },
    { id: FormStep.COMPLIANCE, label: 'Compliance', icon: Shield },
    { id: FormStep.SIGNATORIES, label: 'Signatories', icon: Users },
    { id: FormStep.REVIEW, label: 'Review', icon: CheckCircle },
  ], []);

  /**
   * RENDER: Step indicator
   */
  const StepIndicator = useMemo(() => (
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
  ), [currentStep, steps, theme]);

  /**
   * RENDER: Input component with error handling
   */
  const Input = useCallback(({
    label,
    field,
    type = 'text',
    required = false,
    placeholder,
    helperText,
  }: {
    label: string;
    field: keyof FormState;
    type?: string;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
  }) => {
    const error = getFieldError(field);
    
    return (
      <div>
        <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        <input
          type={type}
          value={(formData[field] as string) || ''}
          onChange={(e) => updateField(field, e.target.value as any)}
          onBlur={() => handleFieldBlur(field)}
          placeholder={placeholder}
          className={cn(
            'w-full px-3 py-2 rounded-lg border transition-colors',
            error ? 'border-rose-600' : theme.border.primary,
            theme.bg.tertiary,
            theme.text.primary
          )}
        />
        {helperText && !error && (
          <p className={cn('text-xs mt-1', theme.text.secondary)}>{helperText}</p>
        )}
        {error && (
          <p className="text-xs mt-1 text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }, [formData, updateField, handleFieldBlur, getFieldError, theme]);

  /**
   * RENDER: Step content
   */
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case FormStep.ACCOUNT_INFO:
        return (
          <div className="space-y-4">
            <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
              Account Information
            </h3>
            
            <Input
              label="Account Number"
              field="accountNumber"
              required
              placeholder="e.g., TR-2025-001"
              helperText="Unique identifier for this trust account"
            />
            
            <Input
              label="Account Name"
              field="accountName"
              required
              placeholder='e.g., "Client Trust Account - IOLTA"'
              helperText='Must include "Trust Account" or "Escrow Account" per state bar rules'
            />
            
            <div>
              <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
                Account Type <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => updateField('accountType', e.target.value as TrustAccountType)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  theme.border.primary,
                  theme.bg.tertiary,
                  theme.text.primary
                )}
              >
                <option value={AccountType.IOLTA}>IOLTA (Interest on Lawyer Trust Account)</option>
                <option value={AccountType.CLIENT_TRUST}>Client Trust Account</option>
                <option value={AccountType.OPERATING}>Operating Account</option>
              </select>
            </div>
            
            <Input
              label="Client ID"
              field="clientId"
              required
              placeholder="Client UUID or identifier"
            />
            
            <Input
              label="Client Name"
              field="clientName"
              required
              placeholder="Full client name"
            />
            
            <Input
              label="Case ID (Optional)"
              field="caseId"
              placeholder="Associated case ID"
            />
          </div>
        );

      case FormStep.BANK_DETAILS:
        return (
          <div className="space-y-4">
            <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
              Bank Details
            </h3>
            
            <Input
              label="Bank Name"
              field="bankName"
              required
              placeholder="e.g., First National Bank"
            />
            
            <Input
              label="Bank Account Number"
              field="bankAccountNumber"
              required
              placeholder="Account number"
            />
            
            <Input
              label="Routing Number"
              field="routingNumber"
              required
              placeholder="9-digit routing number"
              helperText="Must be 9 digits"
            />
            
            <Input
              label="Minimum Balance (Optional)"
              field="minimumBalance"
              type="number"
              placeholder="0.00"
            />
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.interestBearing ?? true}
                  onChange={(e) => updateField('interestBearing', e.target.checked)}
                  className="rounded"
                />
                <span className={cn('text-sm', theme.text.primary)}>
                  Interest-bearing account
                </span>
              </label>
              <p className={cn('text-xs mt-1 ml-6', theme.text.secondary)}>
                IOLTA accounts typically earn interest
              </p>
            </div>
          </div>
        );

      case FormStep.COMPLIANCE:
        return (
          <div className="space-y-4">
            <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
              State Bar Compliance
            </h3>
            
            <Input
              label="Jurisdiction (State)"
              field="jurisdiction"
              required
              placeholder="e.g., CA, NY, TX"
              helperText="Two-letter state code"
            />
            
            {formData.accountType === AccountType.IOLTA && (
              <Input
                label="IOLTA Program ID"
                field="ioltalProgramId"
                required
                placeholder="State IOLTA program registration ID"
              />
            )}
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.stateBarApproved ?? false}
                  onChange={(e) => updateField('stateBarApproved', e.target.checked)}
                  className="rounded"
                />
                <span className={cn('text-sm font-medium', theme.text.primary)}>
                  Bank is approved by state bar for overdraft reporting
                </span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.overdraftReportingEnabled ?? false}
                  onChange={(e) => updateField('overdraftReportingEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className={cn('text-sm font-medium', theme.text.primary)}>
                  Enable automatic overdraft reporting
                </span>
              </label>
            </div>
            
            <div>
              <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
                Record Retention Period (Years)
              </label>
              <select
                value={formData.recordRetentionYears}
                onChange={(e) => updateField('recordRetentionYears', parseInt(e.target.value))}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  theme.border.primary,
                  theme.bg.tertiary,
                  theme.text.primary
                )}
              >
                <option value={5}>5 years</option>
                <option value={6}>6 years</option>
                <option value={7}>7 years (recommended)</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>
        );

      case FormStep.SIGNATORIES:
        return (
          <div className="space-y-4">
            <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
              Authorized Signatories
            </h3>
            
            <div className={cn('p-4 rounded-lg border', theme.status.info.bg, theme.status.info.border)}>
              <p className={cn('text-sm', theme.status.info.text)}>
                Only licensed attorneys may be authorized signatories on trust accounts per state bar rules.
              </p>
            </div>
            
            <Input
              label="Primary Signatory ID"
              field="primarySignatory"
              required
              placeholder="Attorney user ID"
              helperText="Primary responsible attorney"
            />
            
            <div>
              <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
                Additional Authorized Signatories
              </label>
              <textarea
                value={formData.authorizedSignatories?.join(', ') || ''}
                onChange={(e) => updateField('authorizedSignatories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Enter user IDs separated by commas"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  theme.border.primary,
                  theme.bg.tertiary,
                  theme.text.primary
                )}
              />
              <p className={cn('text-xs mt-1', theme.text.secondary)}>
                Comma-separated list of attorney user IDs
              </p>
            </div>
          </div>
        );

      case FormStep.REVIEW:
        return (
          <div className="space-y-6">
            <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
              Review & Submit
            </h3>
            
            <div className="space-y-4">
              <div className={cn('p-4 rounded-lg border', theme.bg.tertiary, theme.border.primary)}>
                <h4 className={cn('font-medium mb-2', theme.text.primary)}>Account Information</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Account Number:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.accountNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Account Name:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.accountName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Type:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.accountType?.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Client:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.clientName}</dd>
                  </div>
                </dl>
              </div>
              
              <div className={cn('p-4 rounded-lg border', theme.bg.tertiary, theme.border.primary)}>
                <h4 className={cn('font-medium mb-2', theme.text.primary)}>Bank Details</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Bank:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.bankName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Routing Number:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.routingNumber}</dd>
                  </div>
                </dl>
              </div>
              
              <div className={cn('p-4 rounded-lg border', theme.bg.tertiary, theme.border.primary)}>
                <h4 className={cn('font-medium mb-2', theme.text.primary)}>Compliance</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Jurisdiction:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.jurisdiction}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>State Bar Approved:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.stateBarApproved ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={cn('text-sm', theme.text.secondary)}>Record Retention:</dt>
                    <dd className={cn('text-sm font-medium', theme.text.primary)}>{formData.recordRetentionYears} years</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {apiError && (
              <div className={cn('p-4 rounded-lg border', theme.status.error.bg, theme.status.error.border)}>
                <div className="flex items-start gap-2">
                  <AlertCircle className={cn('h-5 w-5 flex-shrink-0', theme.status.error.text)} />
                  <div>
                    <h4 className={cn('font-medium mb-1', theme.status.error.text)}>Submission Error</h4>
                    <p className={cn('text-sm', theme.status.error.text)}>{apiError.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }, [currentStep, formData, updateField, theme, Input, getFieldError, apiError]);

  /**
   * MAIN RENDER
   */
  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        {StepIndicator}
        
        {renderStepContent()}
        
        {validationErrors.length > 0 && currentStep !== FormStep.REVIEW && (
          <div className={cn('mt-4 p-4 rounded-lg border', theme.status.error.bg, theme.status.error.border)}>
            <h4 className={cn('font-medium mb-2', theme.status.error.text)}>
              Please correct the following errors:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className={cn('text-sm', theme.status.error.text)}>
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        
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
            {currentStep > FormStep.ACCOUNT_INFO && (
              <button
                onClick={handleBack}
                disabled={isCreating}
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
            
            {currentStep < FormStep.REVIEW ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className={cn(
                  'px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center gap-2',
                  isCreating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isCreating ? (
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
      </div>
    </Card>
  );
};
