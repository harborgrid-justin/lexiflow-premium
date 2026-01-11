/**
 * Intake tab component with basic matter information
 */

import React from 'react';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { FormTextarea } from '../components/FormTextarea';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { FormData, CaseType } from '../types/newCaseTypes';
import { MatterStatus, MatterPriority, PracticeArea } from '@/types';
import { ConflictStatus } from '../hooks/useConflictCheck';

export interface IntakeTabProps {
  formData: FormData;
  generatedNumber: string;
  conflictStatus: ConflictStatus;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: unknown) => void;
}

export const IntakeTab: React.FC<IntakeTabProps> = ({
  formData,
  generatedNumber,
  conflictStatus,
  errors,
  onChange,
}) => {
  const caseTypeOptions = Object.entries(CaseType).map(([, value]) => ({
    label: value,
    value: value
  }));

  const statusOptions = Object.entries(MatterStatus).map(([, value]) => ({
    label: value.replace(/_/g, ' '),
    value: value
  }));

  const priorityOptions = Object.entries(MatterPriority).map(([, value]) => ({
    label: value,
    value: value
  }));

  const practiceAreaOptions = Object.entries(PracticeArea).map(([, value]) => ({
    label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Intake & Basic Information
      </h2>

      {/* Matter/Case Number */}
      <FormField
        id="number"
        label="Matter/Case Number"
        value={generatedNumber}
        onChange={() => {}}
        disabled
        helpText="Auto-generated"
      />

      {/* Title */}
      <FormField
        id="title"
        label="Title"
        value={formData.title}
        onChange={(value) => onChange('title', value)}
        error={errors.title}
        required
        placeholder="e.g., Smith v. Johnson Contract Dispute"
      />

      {/* Client Name */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Client Name *
        </label>
        <div className="relative">
          <input
            id="clientName"
            type="text"
            value={formData.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.clientName
                ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            }`}
            placeholder="Client or party name"
          />
          {formData.clientName && formData.clientName.length >= 3 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {conflictStatus === 'clear' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : conflictStatus === 'conflict' ? (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              ) : null}
            </div>
          )}
        </div>
        {errors.clientName && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.clientName}</p>
        )}
        {conflictStatus === 'clear' && formData.clientName.length >= 3 && (
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">✓ No conflicts found</p>
        )}
      </div>

      {/* Description */}
      <FormTextarea
        id="description"
        label="Description"
        value={formData.description}
        onChange={(value) => onChange('description', value)}
        placeholder="Brief description of the matter..."
      />

      {/* Type, Status, Priority */}
      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          id="type"
          label="Type"
          value={formData.type}
          onChange={(value) => onChange('type', value)}
          options={caseTypeOptions}
        />

        <FormSelect
          id="status"
          label="Status"
          value={formData.status}
          onChange={(value) => onChange('status', value)}
          options={statusOptions}
        />

        <FormSelect
          id="priority"
          label="Priority"
          value={formData.priority}
          onChange={(value) => onChange('priority', value)}
          options={priorityOptions}
        />
      </div>

      {/* Practice Area */}
      <FormSelect
        id="practiceArea"
        label="Practice Area"
        value={formData.practiceArea}
        onChange={(value) => onChange('practiceArea', value)}
        options={practiceAreaOptions}
      />

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="intakeDate"
          label="Intake Date"
          type="date"
          value={formData.intakeDate}
          onChange={(value) => onChange('intakeDate', value)}
        />

        <FormField
          id="openedDate"
          label="Opened Date"
          type="date"
          value={formData.openedDate}
          onChange={(value) => onChange('openedDate', value)}
        />
      </div>
    </div>
  );
};
