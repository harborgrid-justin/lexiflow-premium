/**
 * BankDetailsStep Component
 * Bank details step for trust account creation
 */

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { FormInput } from './FormInput';
import React from 'react';

interface FormState {
  bankName?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
  minimumBalance?: number;
  interestBearing?: boolean;
}

interface BankDetailsStepProps {
  formData: FormState;
  getFieldError: (field: string) => string | undefined;
  updateField: (field: string, value: unknown) => void;
  handleFieldBlur: (field: string) => void;
}

export const BankDetailsStep: React.FC<BankDetailsStepProps> = ({
  formData,
  getFieldError,
  updateField,
  handleFieldBlur,
}) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
        Bank Details
      </h3>

      <FormInput
        label="Bank Name"
        field="bankName"
        required
        placeholder="e.g., First National Bank"
        value={formData.bankName || ''}
        error={getFieldError('bankName')}
        onChange={(value) => updateField('bankName', value)}
        onBlur={() => handleFieldBlur('bankName')}
      />

      <FormInput
        label="Bank Account Number"
        field="bankAccountNumber"
        required
        placeholder="Account number"
        value={formData.bankAccountNumber || ''}
        error={getFieldError('bankAccountNumber')}
        onChange={(value) => updateField('bankAccountNumber', value)}
        onBlur={() => handleFieldBlur('bankAccountNumber')}
      />

      <FormInput
        label="Routing Number"
        field="routingNumber"
        required
        placeholder="9-digit routing number"
        helperText="Must be 9 digits"
        value={formData.routingNumber || ''}
        error={getFieldError('routingNumber')}
        onChange={(value) => updateField('routingNumber', value)}
        onBlur={() => handleFieldBlur('routingNumber')}
      />

      <FormInput
        label="Minimum Balance (Optional)"
        field="minimumBalance"
        type="number"
        placeholder="0.00"
        value={formData.minimumBalance || ''}
        error={getFieldError('minimumBalance')}
        onChange={(value) => updateField('minimumBalance', value)}
        onBlur={() => handleFieldBlur('minimumBalance')}
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
};
