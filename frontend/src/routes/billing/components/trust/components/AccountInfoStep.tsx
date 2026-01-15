/**
 * AccountInfoStep Component
 * Account information step for trust account creation
 */

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme';
import { TrustAccountType } from '@/types/trust-accounts';
import { FormInput } from './FormInput';
interface FormState {
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
  clientId?: string;
  clientName?: string;
  caseId?: string;
}

interface AccountInfoStepProps {
  formData: FormState;
  getFieldError: (field: string) => string | undefined;
  updateField: (field: string, value: unknown) => void;
  handleFieldBlur: (field: string) => void;
}

export function AccountInfoStep({
  formData,
  getFieldError,
  updateField,
  handleFieldBlur,
}: AccountInfoStepProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
        Account Information
      </h3>

      <FormInput
        label="Account Number"
        field="accountNumber"
        required
        placeholder="e.g., TR-2025-001"
        helperText="Unique identifier for this trust account"
        value={formData.accountNumber || ''}
        error={getFieldError('accountNumber')}
        onChange={(value) => updateField('accountNumber', value)}
        onBlur={() => handleFieldBlur('accountNumber')}
      />

      <FormInput
        label="Account Name"
        field="accountName"
        required
        placeholder='e.g., "Client Trust Account - IOLTA"'
        helperText='Must include "Trust Account" or "Escrow Account" per state bar rules'
        value={formData.accountName || ''}
        error={getFieldError('accountName')}
        onChange={(value) => updateField('accountName', value)}
        onBlur={() => handleFieldBlur('accountName')}
      />

      <div>
        <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
          Account Type <span className="text-rose-600">*</span>
        </label>
        <select
          value={formData.accountType}
          onChange={(e) => updateField('accountType', e.target.value)}
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            theme.border.default,
            theme.surface.default,
            theme.text.primary
          )}
        >
          <option value={TrustAccountType.IOLTA}>IOLTA (Interest on Lawyer Trust Account)</option>
          <option value={TrustAccountType.CLIENT_TRUST}>Client Trust Account</option>
          <option value={TrustAccountType.OPERATING}>Operating Account</option>
        </select>
      </div>

      <FormInput
        label="Client ID"
        field="clientId"
        required
        placeholder="Client UUID or identifier"
        value={formData.clientId || ''}
        error={getFieldError('clientId')}
        onChange={(value) => updateField('clientId', value)}
        onBlur={() => handleFieldBlur('clientId')}
      />

      <FormInput
        label="Client Name"
        field="clientName"
        required
        placeholder="Full client name"
        value={formData.clientName || ''}
        error={getFieldError('clientName')}
        onChange={(value) => updateField('clientName', value)}
        onBlur={() => handleFieldBlur('clientName')}
      />

      <FormInput
        label="Case ID (Optional)"
        field="caseId"
        placeholder="Associated case ID"
        value={formData.caseId || ''}
        error={getFieldError('caseId')}
        onChange={(value) => updateField('caseId', value)}
        onBlur={() => handleFieldBlur('caseId')}
      />
    </div>
  );
};
