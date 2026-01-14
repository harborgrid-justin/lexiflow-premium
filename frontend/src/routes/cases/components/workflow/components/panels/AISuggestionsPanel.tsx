/**
 * @file AISuggestionsPanel.tsx
 * @description AI-powered workflow optimization suggestions
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Sparkles } from 'lucide-react';
import type { AIWorkflowSuggestion } from '@/types/workflow-advanced-types';

interface AISuggestionsPanelProps {
  suggestions: AIWorkflowSuggestion[];
  onApplySuggestion: (suggestionId: string) => void;
}

export function AISuggestionsPanel({
  suggestions,
  onApplySuggestion,
}: AISuggestionsPanelProps) {
  const { theme } = useTheme();

  return (
    <Card title="AI-Powered Workflow Optimization">
      <div className="space-y-4">
        <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <div>
              <p className={cn("font-semibold", theme.text.primary)}>
                Machine Learning Engine Active
              </p>
              <p className={cn("text-xs mt-1", theme.text.tertiary)}>
                Analyzing workflow patterns for optimization opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", theme.text.primary)}>
                      {suggestion.title}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {(suggestion.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className={cn("text-sm mt-2", theme.text.secondary)}>
                    {suggestion.description}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApplySuggestion(suggestion.id)}
                >
                  Apply
                </Button>
              </div>

              <div className="flex gap-4 text-xs">
                {suggestion.impact.durationReduction && (
                  <div>
                    <p className={cn(theme.text.tertiary)}>Duration Reduction</p>
                    <p className="font-bold text-green-600">
                      {(suggestion.impact.durationReduction * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
                {suggestion.impact.costSavings && (
                  <div>
                    <p className={cn(theme.text.tertiary)}>Cost Savings</p>
                    <p className="font-bold text-green-600">
                      ${suggestion.impact.costSavings.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className={cn(theme.text.tertiary)}>Difficulty</p>
                  <p className={cn("font-bold", theme.text.primary)}>
                    {suggestion.implementationDifficulty}
                  </p>
                </div>
              </div>

              <div className={cn("mt-3 p-3 rounded border text-xs", theme.surface.highlight, theme.border.default)}>
                <strong>Rationale:</strong> {suggestion.rationale}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

AISuggestionsPanel.displayName = 'AISuggestionsPanel';
