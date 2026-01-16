/**
 * Parties and team assignment tab component
 */

import React from 'react';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { FormTextarea } from '../components/FormTextarea';
import { FormData } from '../types/newCaseTypes';

export interface PartiesTabProps {
  formData: FormData;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: unknown) => void;
}

export const PartiesTab: React.FC<PartiesTabProps> = ({ formData, errors, onChange }) => {
  const riskLevelOptions = [
    { label: 'Select risk level...', value: '' },
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Critical', value: 'Critical' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Parties & Team Assignment
      </h2>

      <FormField
        id="responsibleAttorneyName"
        label="Responsible Attorney"
        value={formData.responsibleAttorneyName}
        onChange={(value) => onChange('responsibleAttorneyName', value)}
        error={errors.responsibleAttorneyName}
        required
        placeholder="Attorney name"
      />

      <FormField
        id="originatingAttorneyName"
        label="Originating Attorney"
        value={formData.originatingAttorneyName}
        onChange={(value) => onChange('originatingAttorneyName', value)}
        placeholder="Attorney who originated the matter"
      />

      {/* Opposing Party Section */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Opposing Party
        </h3>

        <FormField
          id="opposingPartyName"
          label="Opposing Party Name"
          value={formData.opposingPartyName || ''}
          onChange={(value) => onChange('opposingPartyName', value)}
          placeholder="Name of opposing party"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <FormField
            id="opposingCounsel"
            label="Opposing Counsel"
            value={formData.opposingCounsel || ''}
            onChange={(value) => onChange('opposingCounsel', value)}
            placeholder="Attorney name"
          />

          <FormField
            id="opposingCounselFirm"
            label="Opposing Counsel Firm"
            value={formData.opposingCounselFirm || ''}
            onChange={(value) => onChange('opposingCounselFirm', value)}
            placeholder="Law firm name"
          />
        </div>
      </div>

      {/* Conflict Check Section */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Conflict Check
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.conflictCheckCompleted || false}
              onChange={(e) => onChange('conflictCheckCompleted', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Conflict Check Completed
            </span>
          </label>
        </div>

        {formData.conflictCheckCompleted && (
          <FormField
            id="conflictCheckDate"
            label="Conflict Check Date"
            type="date"
            value={formData.conflictCheckDate || ''}
            onChange={(value) => onChange('conflictCheckDate', value || null)}
          />
        )}

        <div className="mt-4">
          <FormTextarea
            id="conflictCheckNotes"
            label="Conflict Check Notes"
            value={formData.conflictCheckNotes || ''}
            onChange={(value) => onChange('conflictCheckNotes', value)}
            rows={3}
            placeholder="Notes about conflict check findings..."
          />
        </div>
      </div>

      {/* Risk Management Section */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Risk Management
        </h3>

        <FormSelect
          id="riskLevel"
          label="Risk Level"
          value={formData.riskLevel || ''}
          onChange={(value) => onChange('riskLevel', value)}
          options={riskLevelOptions}
        />

        <div className="mt-4">
          <FormTextarea
            id="riskNotes"
            label="Risk Notes"
            value={formData.riskNotes || ''}
            onChange={(value) => onChange('riskNotes', value)}
            rows={3}
            placeholder="Describe potential risks and mitigation strategies..."
          />
        </div>
      </div>
    </div>
  );
};
