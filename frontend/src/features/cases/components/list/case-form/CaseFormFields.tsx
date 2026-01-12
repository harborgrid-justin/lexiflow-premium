/**
 * CaseFormFields.tsx
 *
 * Form fields for case creation including title, client, matter type,
 * value, and description. Adapts placeholders based on pre-filing vs filed status.
 *
 * @module components/case-list/case-form/CaseFormFields
 * @category Case Management - Forms
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';

// Hooks & Context
import { useTheme } from '@/features/theme';

// Utils
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case, MatterType } from '@/types';

interface CaseFormFieldsProps {
  formData: Partial<Case>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Case>>>;
  isPreFiling: boolean;
}

export const CaseFormFields: React.FC<CaseFormFieldsProps> = ({ formData, setFormData, isPreFiling }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <Input
        label="Case / Matter Title"
        placeholder={isPreFiling ? "e.g. In Re: TechCorp Investigation" : "e.g. Smith v. Jones"}
        value={formData.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})}
        autoFocus
        required
      />
      <Input
        label="Client"
        placeholder="Client Name"
        value={formData.client}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, client: e.target.value})}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
          <select
            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
            value={formData.matterType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, matterType: e.target.value as MatterType})}
          >
            <option value="Litigation">Litigation</option>
            <option value="Appeal">Appeal</option>
            <option value="M&A">M&A</option>
            <option value="IP">Intellectual Property</option>
            <option value="Real Estate">Real Estate</option>
          </select>
        </div>
        <Input
          label="Est. Value ($)"
          type="number"
          value={formData.value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, value: Number(e.target.value)})}
        />
      </div>

      {!isPreFiling && (
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <Input
              label="Original Case Number"
              placeholder="e.g. 1:24-cv-00123"
              value={formData.origCaseNumber || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, origCaseNumber: e.target.value})}
            />
            <Input
              label="Assigned Judge"
              placeholder="Presiding Judge"
              value={formData.judge || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, judge: e.target.value})}
            />
        </div>
      )}

      <div className="pt-2">
        <TextArea
          label="Case Summary / Description"
          rows={isPreFiling ? 11 : 3}
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
          placeholder="Brief overview of the matter..."
        />
      </div>
    </div>
  );
};
