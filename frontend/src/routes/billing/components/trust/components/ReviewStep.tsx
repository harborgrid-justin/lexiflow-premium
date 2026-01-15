/**
 * ReviewStep Component
 * Review and summary step before form submission
 */

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { AlertCircle } from 'lucide-react';
interface FormState {
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
  clientName?: string;
  bankName?: string;
  routingNumber?: string;
  jurisdiction?: string;
  stateBarApproved?: boolean;
  recordRetentionYears?: number;
}

interface ReviewStepProps {
  formData: FormState;
  apiError?: { message: string } | null;
}

export function ReviewStep({ formData, apiError }: ReviewStepProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <h3 className={cn('text-lg font-bold mb-4', theme.text.primary)}>
        Review & Submit
      </h3>

      <div className="space-y-4">
        <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
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

        <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
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

        <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
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
};
