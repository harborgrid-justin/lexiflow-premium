import { Button } from '@/shared/ui/atoms/Button/Button';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Loader2, Save } from 'lucide-react';

interface Step3DraftReviewProps {
  result: string;
  isStreaming: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function Step3DraftReview({ result, isStreaming, isSaving, onSave }: Step3DraftReviewProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h4 className={cn("text-lg font-semibold", theme.text.primary)}>Review Draft</h4>
        {isStreaming && (
          <span className={cn("text-sm flex items-center", theme.text.secondary)}>
            <Loader2 className="h-3 w-3 animate-spin mr-2" /> Generating...
          </span>
        )}
      </div>

      <div className={cn("flex-1 p-4 border rounded-lg overflow-y-auto font-mono text-sm whitespace-pre-wrap", theme.surface.default, theme.border.default, theme.text.primary)}>
        {result || <span className="text-gray-400 italic">Waiting for generation...</span>}
      </div>

      <div className="pt-4">
        <Button
          variant="primary"
          onClick={onSave}
          icon={Save}
          className="w-full"
          disabled={isStreaming || isSaving || !result}
          isLoading={isSaving}
        >
          Save to Case File
        </Button>
      </div>
    </div>
  );
}
