import { Button } from '@/components/ui/atoms/Button';
import { useNotify } from '@/hooks/useNotify';
import { useMutation } from '@/hooks/backend';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/utils/cn';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useState } from 'react';
import { DefinitionCard } from './DefinitionCard';
import { GovernanceCard } from './GovernanceCard';
import { TechSpecsCard } from './TechSpecsCard';
import { UsageStatsCard } from './UsageStatsCard';
import type { DictionaryItemDetailProps } from './types';

export const DictionaryItemDetail: React.FC<DictionaryItemDetailProps> = ({ item, onClose }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [formData, setFormData] = useState({ ...item });
  const [isGenerating, setIsGenerating] = useState(false);

  const { mutate: saveChanges, isLoading } = useMutation(
    async (data) => DataService.catalog.updateItem(item.id, data),
    {
      onSuccess: () => { notify.success('Dictionary item updated successfully.'); onClose(); },
      onError: () => notify.error('Failed to update item.'),
    }
  );

  const handleAISuggestion = async () => {
    setIsGenerating(true);
    try {
      const suggestion = await GeminiService.generateDraft(
        `Generate a concise technical description for a database column named '${formData.column}' in table '${formData.table}'. Context: Legal Tech Enterprise Application. Domain: ${formData.domain}.`,
        'Description'
      );
      setFormData((prev) => ({ ...prev, description: suggestion.replace(/<[^>]*>?/gm, '') }));
    } catch {
      notify.error('AI Suggestion failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full animate-in slide-in-from-right duration-200', theme.surface.highlight)}>
      <div className={cn('p-4 border-b flex justify-between items-center', theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={onClose}>Back</Button>
          <div>
            <h2 className={cn('font-bold text-lg font-mono', theme.primary.text)}>{formData.table}.{formData.column}</h2>
            <p className={cn('text-xs', theme.text.secondary)}>ID: {formData.id}</p>
          </div>
        </div>
        <Button variant="primary" icon={Save} onClick={() => saveChanges(formData)} isLoading={isLoading}>Save Changes</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <DefinitionCard formData={formData} setFormData={setFormData} onAISuggestion={handleAISuggestion} isGenerating={isGenerating} />
              <GovernanceCard formData={formData} setFormData={setFormData} />
            </div>
            <div className="space-y-6">
              <TechSpecsCard formData={formData} />
              <UsageStatsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { DictionaryItemDetailProps } from './types';
