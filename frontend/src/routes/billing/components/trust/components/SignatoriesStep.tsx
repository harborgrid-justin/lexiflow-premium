/**
 * SignatoriesStep Component
 * Authorized signatories step for trust account creation
 */

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import { FormInput } from './FormInput';
interface FormState {
  primarySignatory?: string;
  authorizedSignatories?: string[];
}

interface SignatoriesStepProps {
  formData: FormState;
  getFieldError: (field: string) => string | undefined;
  updateField: (field: string, value: unknown) => void;
  handleFieldBlur: (field: string) => void;
}

export function SignatoriesStep({
  formData,
  getFieldError,
  updateField,
  handleFieldBlur,
}: SignatoriesStepProps) {
  const { theme } = useTheme();

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

      <FormInput
        label="Primary Signatory ID"
        field="primarySignatory"
        required
        placeholder="Attorney user ID"
        helperText="Primary responsible attorney"
        value={formData.primarySignatory || ''}
        error={getFieldError('primarySignatory')}
        onChange={(value) => updateField('primarySignatory', value)}
        onBlur={() => handleFieldBlur('primarySignatory')}
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
            theme.border.default,
            theme.surface.default,
            theme.text.primary
          )}
        />
        <p className={cn('text-xs mt-1', theme.text.secondary)}>
          Comma-separated list of attorney user IDs
        </p>
      </div>
    </div>
  );
};
