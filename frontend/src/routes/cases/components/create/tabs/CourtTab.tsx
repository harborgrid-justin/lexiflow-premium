/**
 * Court information tab component
 */

import React from 'react';

import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { type FormData } from '../types/newCaseTypes';

export interface CourtTabProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: unknown) => void;
}

export const CourtTab: React.FC<CourtTabProps> = ({ formData, onChange }) => {
  const juryDemandOptions = [
    { label: 'None', value: 'None' },
    { label: 'Plaintiff', value: 'Plaintiff' },
    { label: 'Defendant', value: 'Defendant' },
    { label: 'Both', value: 'Both' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Court Information
      </h2>

      {/* Court & Jurisdiction */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="court"
          label="Court"
          value={formData.court}
          onChange={(value) => onChange('court', value)}
          placeholder="e.g., U.S. District Court, Southern District of New York"
        />

        <FormField
          id="jurisdiction"
          label="Jurisdiction"
          value={formData.jurisdiction}
          onChange={(value) => onChange('jurisdiction', value)}
          placeholder="e.g., Federal, New York"
        />
      </div>

      {/* Judges */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          id="judge"
          label="Presiding Judge"
          value={formData.judge || ''}
          onChange={(value) => onChange('judge', value || null)}
          placeholder="Judge name"
        />

        <FormField
          id="referredJudge"
          label="Referred Judge"
          value={formData.referredJudge || ''}
          onChange={(value) => onChange('referredJudge', value || null)}
          placeholder="Referred judge name"
        />

        <FormField
          id="magistrateJudge"
          label="Magistrate Judge"
          value={formData.magistrateJudge || ''}
          onChange={(value) => onChange('magistrateJudge', value || null)}
          placeholder="Magistrate name"
        />
      </div>

      {/* Federal Litigation Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="causeOfAction"
          label="Cause of Action"
          value={formData.causeOfAction}
          onChange={(value) => onChange('causeOfAction', value)}
          placeholder="e.g., Breach of Contract"
        />

        <FormField
          id="natureOfSuit"
          label="Nature of Suit"
          value={formData.natureOfSuit}
          onChange={(value) => onChange('natureOfSuit', value)}
          placeholder="Nature of suit description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="natureOfSuitCode"
          label="Nature of Suit Code"
          value={formData.natureOfSuitCode}
          onChange={(value) => onChange('natureOfSuitCode', value)}
          placeholder="e.g., 110, 190"
        />

        <FormSelect
          id="juryDemand"
          label="Jury Demand"
          value={formData.juryDemand}
          onChange={(value) => onChange('juryDemand', value)}
          options={juryDemandOptions}
        />
      </div>

      {/* Case Dates */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          id="filingDate"
          label="Filing Date"
          type="date"
          value={formData.filingDate}
          onChange={(value) => onChange('filingDate', value)}
        />

        <FormField
          id="trialDate"
          label="Trial Date"
          type="date"
          value={formData.trialDate || ''}
          onChange={(value) => onChange('trialDate', value || null)}
        />

        <FormField
          id="dateTerminated"
          label="Date Terminated"
          type="date"
          value={formData.dateTerminated || ''}
          onChange={(value) => onChange('dateTerminated', value || null)}
        />
      </div>
    </div>
  );
};
