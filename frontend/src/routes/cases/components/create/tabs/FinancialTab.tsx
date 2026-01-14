/**
 * Financial information tab component
 */

import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { FormTextarea } from '../components/FormTextarea';
import { CurrencyInput } from '../components/CurrencyInput';
import { FormData } from '../types/newCaseTypes';

export interface FinancialTabProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: unknown) => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({ formData, onChange }) => {
  const billingTypeOptions = [
    { label: 'Select billing type...', value: '' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Flat Fee', value: 'flat_fee' },
    { label: 'Contingency', value: 'contingency' },
    { label: 'Retainer', value: 'retainer' },
    { label: 'Blended', value: 'blended' },
    { label: 'Value Based', value: 'value_based' },
    { label: 'Pro Bono', value: 'pro_bono' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Financial Information
      </h2>

      {/* Billing Type */}
      <FormSelect
        id="billingType"
        label="Billing Type"
        value={formData.billingType || ''}
        onChange={(value) => onChange('billingType', value)}
        options={billingTypeOptions}
      />

      {/* Value and Budget */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          id="estimatedValue"
          label="Estimated Value"
          value={formData.estimatedValue}
          onChange={(value) => onChange('estimatedValue', value)}
        />

        <CurrencyInput
          id="budgetAmount"
          label="Budget Amount"
          value={formData.budgetAmount}
          onChange={(value) => onChange('budgetAmount', value)}
        />
      </div>

      {/* Hourly Rate & Retainer */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          id="hourlyRate"
          label="Hourly Rate"
          value={formData.hourlyRate}
          onChange={(value) => onChange('hourlyRate', value)}
        />

        <CurrencyInput
          id="retainerAmount"
          label="Retainer Amount"
          value={formData.retainerAmount}
          onChange={(value) => onChange('retainerAmount', value)}
        />
      </div>

      {/* Flat Fee & Contingency */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          id="flatFee"
          label="Flat Fee"
          value={formData.flatFee || 0}
          onChange={(value) => onChange('flatFee', value)}
        />

        <CurrencyInput
          id="contingencyPercentage"
          label="Contingency Percentage"
          value={formData.contingencyPercentage || 0}
          onChange={(value) => onChange('contingencyPercentage', value)}
          isPercentage
        />
      </div>

      {/* Dates Section */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Important Dates
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="targetCloseDate"
            label="Target Close Date"
            type="date"
            value={formData.targetCloseDate || ''}
            onChange={(value) => onChange('targetCloseDate', value || null)}
          />

          <FormField
            id="statuteOfLimitations"
            label="Statute of Limitations"
            type="date"
            value={formData.statuteOfLimitations || ''}
            onChange={(value) => onChange('statuteOfLimitations', value || null)}
          />
        </div>
      </div>

      {/* Internal Notes */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Internal Notes
        </h3>

        <FormTextarea
          id="internalNotes"
          label="Notes (Internal Only)"
          value={formData.internalNotes || ''}
          onChange={(value) => onChange('internalNotes', value)}
          rows={5}
          placeholder="Internal notes, strategy notes, confidential information..."
        />
      </div>
    </div>
  );
};
