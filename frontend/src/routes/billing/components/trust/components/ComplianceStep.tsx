/**
 * ComplianceStep Component
 * Compliance and regulatory information step
 */

import { cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { TrustAccountType } from '@/types/trust-accounts';
import { FormInput } from './FormInput';
interface FormState {
  jurisdiction?: string;
  accountType?: string;
  ioltalProgramId?: string;
  stateBarApproved?: boolean;
  overdraftReportingEnabled?: boolean;
  recordRetentionYears?: number;
}

interface ComplianceStepProps {
  formData: FormState;
  getFieldError: (field: string) => string | undefined;
  updateField: (field: string, value: unknown) => void;
  handleFieldBlur: (field: string) => void;
}

export function ComplianceStep({
  formData,
  getFieldError,
  updateField,
  handleFieldBlur,
}: ComplianceStepProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
        State Bar Compliance
      </h3>

      <FormInput
        label="Jurisdiction (State)"
        field="jurisdiction"
        required
        placeholder="e.g., CA, NY, TX"
        helperText="Two-letter state code"
        value={formData.jurisdiction || ''}
        error={getFieldError('jurisdiction')}
        onChange={(value) => updateField('jurisdiction', value)}
        onBlur={() => handleFieldBlur('jurisdiction')}
      />

      {formData.accountType === TrustAccountType.IOLTA && (
        <FormInput
          label="IOLTA Program ID"
          field="ioltalProgramId"
          required
          placeholder="State IOLTA program registration ID"
          value={formData.ioltalProgramId || ''}
          error={getFieldError('ioltalProgramId')}
          onChange={(value) => updateField('ioltalProgramId', value)}
          onBlur={() => handleFieldBlur('ioltalProgramId')}
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
            theme.border.default,
            theme.surface.default,
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
};
