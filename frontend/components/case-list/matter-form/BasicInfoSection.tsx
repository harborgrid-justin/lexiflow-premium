import React from 'react';
import { FileText } from 'lucide-react';
import type { MatterFormData, FormErrors } from './types';
import { PracticeArea, MatterType, MatterStatus, MatterPriority } from '../../../types';

// Define arrays locally from the type unions
const MATTER_TYPES: MatterType[] = ['Case', 'Advisory', 'Compliance'];
const MATTER_STATUSES: MatterStatus[] = [MatterStatus.ACTIVE, MatterStatus.PENDING, MatterStatus.CLOSED, MatterStatus.ON_HOLD];
const MATTER_PRIORITIES: MatterPriority[] = [MatterPriority.LOW, MatterPriority.MEDIUM, MatterPriority.HIGH, MatterPriority.URGENT];
const PRACTICE_AREAS: PracticeArea[] = [
  'Corporate',
  'Litigation',
  'Real Estate',
  'IP',
  'Tax',
  'Employment',
  'Criminal',
  'Immigration',
  'Environmental'
];

interface BasicInfoSectionProps {
  formData: MatterFormData;
  errors: FormErrors;
  onChange: (field: keyof MatterFormData, value: unknown) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, errors, onChange }) => (
  <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
      <FileText className="w-5 h-5 mr-2" />
      Basic Information
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matter Number</label>
        <input
          type="text"
          value={formData.matterNumber}
          onChange={(e) => onChange('matterNumber', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Auto-generated if empty"
        />
      </div>

      <div>
        <label htmlFor="matterType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matter Type *</label>
        <select
          id="matterType"
          value={formData.matterType}
          onChange={(e) => onChange('matterType', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        >
          {MATTER_TYPES.map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matter Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg ${
            errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
          } text-slate-900 dark:text-slate-100`}
          placeholder="Brief descriptive title"
        />
        {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
          placeholder="Detailed matter description"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        >
          {MATTER_STATUSES.map(status => (
            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => onChange('priority', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
        >
          {MATTER_PRIORITIES.map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        <label htmlFor="practiceArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Practice Area *</label>
        <select
          id="practiceArea"
          value={formData.practiceArea}
          onChange={(e) => onChange('practiceArea', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg ${
            errors.practiceArea ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
          } text-slate-900 dark:text-slate-100`}
        >
          {PRACTICE_AREAS.map(area => (
            <option key={area} value={area}>{area.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {errors.practiceArea && <p className="mt-1 text-sm text-rose-600">{errors.practiceArea}</p>}
      </div>
    </div>
  </section>
);
