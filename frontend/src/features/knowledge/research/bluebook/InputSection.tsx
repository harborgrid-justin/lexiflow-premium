import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Plus, Trash2, Upload, Wand2 } from 'lucide-react';
import { FormatOptionsCard } from './FormatOptionsCard';
import type { FormatOptions } from './types';

interface InputSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onFormat: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSamples: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  formatOptions: FormatOptions;
  onFormatOptionsChange: (options: FormatOptions) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  onInputChange,
  onFormat,
  onFileUpload,
  onAddSamples,
  onClearAll,
  isProcessing,
  formatOptions,
  onFormatOptionsChange
}) => {
  const { theme } = useTheme();

  return (
    <Card title="Input Citations" subtitle="Enter citations (one per line) or upload a file">
      <div className="space-y-4">
        <textarea
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange(e.target.value)}
          placeholder={`Enter citations here, one per line...

Example:
Brown v. Board of Education, 347 U.S. 483 (1954)
42 U.S.C. § 1983 (2018)
U.S. Const. amend. XIV, § 1`}
          className={cn(
            "w-full h-64 p-4 rounded-lg border resize-none font-mono text-sm",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon={Wand2}
            onClick={onFormat}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Format Citations'}
          </Button>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".txt"
              onChange={onFileUpload}
              className="hidden"
            />
            <div className="inline-block">
              <Button variant="outline" icon={Upload}>
                Upload File
              </Button>
            </div>
          </label>

          <Button variant="outline" icon={Plus} onClick={onAddSamples}>
            Add Samples
          </Button>

          <Button variant="outline" icon={Trash2} onClick={onClearAll}>
            Clear All
          </Button>
        </div>

        <FormatOptionsCard
          options={formatOptions}
          formatStyle={formatOptions.format}
          onOptionsChange={onFormatOptionsChange}
          onFormatStyleChange={(style) => onFormatOptionsChange({ ...formatOptions, format: style })}
        />
      </div>
    </Card>
  );
};
