import { Wand2 } from 'lucide-react';

import { Input } from '@/components/atoms/Input';
import { TextArea } from '@/components/atoms/TextArea';
import { Card } from '@/components/molecules/Card';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';


export function DefinitionCard({
  formData,
  setFormData,
  onAISuggestion,
  isGenerating,
}) {
  const { theme } = useTheme();

  return (
    <Card title="Definition & Metadata">
      <div className="space-y-4">
        <div className="relative">
          <div className="flex justify-between mb-1">
            <label className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Description</label>
            <button onClick={onAISuggestion} disabled={isGenerating} className="text-xs text-purple-600 flex items-center hover:underline">
              <Wand2 className="h-3 w-3 mr-1" /> {isGenerating ? 'Generating...' : 'AI Suggest'}
            </button>
          </div>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data Type" value={formData.dataType} disabled className="font-mono text-xs" />
          <div>
            <label className={cn('block text-xs font-bold uppercase mb-1.5', theme.text.secondary)}>Domain Owner</label>
            <select
              className={cn('w-full px-3 py-2 border rounded-md text-sm', theme.surface.default, theme.border.default, theme.text.primary)}
              value={formData.domain}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, domain: e.target.value })}
            >
              <option value="Legal">Legal</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};
