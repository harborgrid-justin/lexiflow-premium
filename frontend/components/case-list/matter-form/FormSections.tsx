import React from 'react';
import { Building2, Users, Calendar, DollarSign } from 'lucide-react';
import type { MatterFormData, FormErrors } from './types';

interface ClientSectionProps {
  formData: MatterFormData;
  errors: FormErrors;
  onChange: (field: keyof MatterFormData, value: unknown) => void;
}

export const ClientSection: React.FC<ClientSectionProps> = ({ formData, errors, onChange }) => (
  <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
      <Building2 className="w-5 h-5 mr-2" />
      Client Information
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name *</label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('clientName', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg ${
            errors.clientName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
          } text-slate-900 dark:text-slate-100`}
          placeholder="Client or organization name"
        />
        {errors.clientName && <p className="mt-1 text-sm text-rose-600">{errors.clientName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Contact</label>
        <input
          type="text"
          value={formData.clientContact}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('clientContact', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Primary contact person"
        />
      </div>
    </div>
  </section>
);

interface AttorneySectionProps {
  formData: MatterFormData;
  errors: FormErrors;
  onChange: (field: keyof MatterFormData, value: unknown) => void;
}

export const AttorneySection: React.FC<AttorneySectionProps> = ({ formData, errors, onChange }) => (
  <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
      <Users className="w-5 h-5 mr-2" />
      Attorney Assignment
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Attorney *</label>
        <input
          type="text"
          value={formData.leadAttorneyName}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('leadAttorneyName', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg ${
            errors.leadAttorneyName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
          } text-slate-900 dark:text-slate-100`}
          placeholder="Lead attorney name"
        />
        {errors.leadAttorneyName && <p className="mt-1 text-sm text-rose-600">{errors.leadAttorneyName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Originating Attorney</label>
        <input
          type="text"
          value={formData.originatingAttorneyName || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('originatingAttorneyName', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Attorney who brought in the matter"
        />
      </div>
    </div>
  </section>
);

interface DatesSectionProps {
  formData: MatterFormData;
  errors: FormErrors;
  onChange: (field: keyof MatterFormData, value: unknown) => void;
}

export const DatesSection: React.FC<DatesSectionProps> = ({ formData, errors, onChange }) => (
  <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
      <Calendar className="w-5 h-5 mr-2" />
      Important Dates
    </h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label htmlFor="opened_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opened Date *</label>
        <input
          id="opened_date"
          type="date"
          value={formData.openedDate ? formData.openedDate.split('T')[0] : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('openedDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg ${
            errors.openedDate ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
          } text-slate-900 dark:text-slate-100`}
        />
        {errors.openedDate && <p className="mt-1 text-sm text-rose-600">{errors.openedDate}</p>}
      </div>

      <div>
        <label htmlFor="target_close_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Close Date</label>
        <input
          id="target_close_date"
          type="date"
          value={formData.targetCloseDate ? formData.targetCloseDate.split('T')[0] : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('targetCloseDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="statute_of_limitations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statute of Limitations</label>
        <input
          id="statute_of_limitations"
          type="date"
          value={formData.statute_of_limitations ? formData.statute_of_limitations.split('T')[0] : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('statute_of_limitations', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  </section>
);

interface BillingSectionProps {
  formData: MatterFormData;
  onChange: (field: keyof MatterFormData, value: unknown) => void;
}

export const BillingSection: React.FC<BillingSectionProps> = ({ formData, onChange }) => (
  <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
      <DollarSign className="w-5 h-5 mr-2" />
      Billing Information
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="billingType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Type</label>
        <select
          id="billingType"
          value={formData.billingType}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('billingType', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        >
          <option value="Hourly">Hourly</option>
          <option value="Flat Fee">Flat Fee</option>
          <option value="Contingency">Contingency</option>
          <option value="Retainer">Retainer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hourly Rate</label>
        <input
          type="number"
          value={formData.hourlyRate || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('hourlyRate', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="$ per hour"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Amount</label>
        <input
          type="number"
          value={formData.budgetAmount || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('budgetAmount', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Total budget"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Retainer Amount</label>
        <input
          type="number"
          value={formData.retainerAmount || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('retainerAmount', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Initial retainer"
        />
      </div>
    </div>
  </section>
);
