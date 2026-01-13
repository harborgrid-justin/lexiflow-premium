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

import { useCreateTrustAccount, useTrustAccountValidation } from '@/hooks/useTrustAccounts';
import { Card } from '@/shared/ui/molecules/Card/Card';
import type { CreateTrustAccountDto, TrustAccountStatus } from '@/types/trust-accounts';
import { TrustAccountType as AccountType } from '@/types/trust-accounts';
import { Building, CheckCircle, Landmark, Shield, Users } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { AccountInfoStep } from './components/AccountInfoStep';
import { BankDetailsStep } from './components/BankDetailsStep';
import { ComplianceStep } from './components/ComplianceStep';
import { FormNavigation } from './components/FormNavigation';
import { ReviewStep } from './components/ReviewStep';
import { SignatoriesStep } from './components/SignatoriesStep';
import { StepIndicator, type Step } from './components/StepIndicator';

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
  jurisdiction?: string;
  stateBarApproved?: boolean;
  overdraftReportingEnabled?: boolean;
  clientConsentForLocation?: boolean;
  recordRetentionYears?: number;
  authorizedSignatories?: string[];
  primarySignatory?: string;
  ioltalProgramId?: string;
}

interface FieldError {
  field: keyof FormState;
  message: string;
}

interface StepValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

interface CreateTrustAccountFormProps {
  onSuccess?: (accountId: string) => void;
  onCancel?: () => void;
}

export const CreateTrustAccountForm: React.FC<CreateTrustAccountFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { createAccount, isCreating, error: apiError } = useCreateTrustAccount();
  const { validateAccountTitle } = useTrustAccountValidation();

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

  const validateStep = useCallback((step: FormStep, data: FormState): StepValidationResult => {
    const errors: FieldError[] = [];

    switch (step) {
      case FormStep.ACCOUNT_INFO:
        if (!data.accountNumber?.trim()) errors.push({ field: 'accountNumber', message: 'Account number is required' });
        if (!data.accountName?.trim()) {
          errors.push({ field: 'accountName', message: 'Account name is required' });
        } else if (!validateAccountTitle(data.accountName)) {
          errors.push({ field: 'accountName', message: 'Account name must include "Trust Account" or "Escrow Account"' });
        }
        if (!data.clientId?.trim()) errors.push({ field: 'clientId', message: 'Client is required' });
        if (!data.clientName?.trim()) errors.push({ field: 'clientName', message: 'Client name is required' });
        break;

      case FormStep.BANK_DETAILS:
        if (!data.bankName?.trim()) errors.push({ field: 'bankName', message: 'Bank name is required' });
        if (!data.bankAccountNumber?.trim()) errors.push({ field: 'bankAccountNumber', message: 'Bank account number is required' });
        if (!data.routingNumber?.trim()) {
          errors.push({ field: 'routingNumber', message: 'Routing number is required' });
        } else if (!/^\d{9}$/.test(data.routingNumber)) {
          errors.push({ field: 'routingNumber', message: 'Routing number must be 9 digits' });
        }
        break;

      case FormStep.COMPLIANCE:
        if (!data.jurisdiction?.trim()) errors.push({ field: 'jurisdiction', message: 'Jurisdiction is required' });
        if (data.stateBarApproved === undefined) errors.push({ field: 'stateBarApproved', message: 'State bar approval status is required' });
        if (data.accountType === AccountType.IOLTA && !data.ioltalProgramId?.trim()) {
          errors.push({ field: 'ioltalProgramId', message: 'IOLTA program ID is required for IOLTA accounts' });
        }
        break;

      case FormStep.SIGNATORIES:
        if (!data.authorizedSignatories || data.authorizedSignatories.length === 0) {
          errors.push({ field: 'authorizedSignatories', message: 'At least one authorized signatory is required' });
        }
        if (!data.primarySignatory?.trim()) errors.push({ field: 'primarySignatory', message: 'Primary signatory is required' });
        break;

      case FormStep.REVIEW:
        [FormStep.ACCOUNT_INFO, FormStep.BANK_DETAILS, FormStep.COMPLIANCE, FormStep.SIGNATORIES].forEach((s) => {
          errors.push(...validateStep(s, data).errors);
        });
        break;
    }

    return { isValid: errors.length === 0, errors };
  }, [validateAccountTitle]);

  const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const handleFieldBlur = useCallback((field: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(field));
    const validation = validateStep(currentStep, formData);
    setValidationErrors(validation.errors);
  }, [currentStep, formData, validateStep]);

  const handleNext = useCallback(() => {
    const validation = validateStep(currentStep, formData);
    setValidationErrors(validation.errors);
    if (validation.isValid) setCurrentStep((prev) => Math.min(prev + 1, FormStep.REVIEW));
  }, [currentStep, formData, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, FormStep.ACCOUNT_INFO));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateStep(FormStep.REVIEW, formData);
    setValidationErrors(validation.errors);
    if (!validation.isValid) return;

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

  const getFieldError = useCallback((field: keyof FormState): string | undefined => {
    if (!touched.has(field)) return undefined;
    return validationErrors.find((e) => e.field === field)?.message;
  }, [touched, validationErrors]);

  const steps: Step[] = useMemo(() => [
    { id: FormStep.ACCOUNT_INFO, label: 'Account Info', icon: Landmark },
    { id: FormStep.BANK_DETAILS, label: 'Bank Details', icon: Building },
    { id: FormStep.COMPLIANCE, label: 'Compliance', icon: Shield },
    { id: FormStep.SIGNATORIES, label: 'Signatories', icon: Users },
    { id: FormStep.REVIEW, label: 'Review', icon: CheckCircle },
  ], []);

  const renderStepContent = useCallback(() => {
    const commonProps = { 
      formData, 
      getFieldError: (field: string) => getFieldError(field as keyof FormState), 
      updateField, 
      handleFieldBlur: (field: string) => handleFieldBlur(field as keyof FormState)
    };

    switch (currentStep) {
      case FormStep.ACCOUNT_INFO:
        return <AccountInfoStep {...commonProps} />;
      case FormStep.BANK_DETAILS:
        return <BankDetailsStep {...commonProps} />;
      case FormStep.COMPLIANCE:
        return <ComplianceStep {...commonProps} />;
      case FormStep.SIGNATORIES:
        return <SignatoriesStep {...commonProps} />;
      case FormStep.REVIEW:
        return <ReviewStep formData={formData} apiError={apiError} />;
      default:
        return null;
    }
  }, [currentStep, formData, getFieldError, updateField, handleFieldBlur, apiError]);

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {renderStepContent()}
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isFirstStep={currentStep === FormStep.ACCOUNT_INFO}
          isLastStep={currentStep === FormStep.REVIEW}
          isSubmitting={isCreating}
          onCancel={onCancel}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </Card>
  );
};
