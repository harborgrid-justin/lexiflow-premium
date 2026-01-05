/**
 * CaseListClosing.tsx
 *
 * AI-powered case closing workflow with automated checklist generation
 * for closing binders and final documentation.
 *
 * @module components/case-list/CaseListClosing
 * @category Case Management - Closing Workflow
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ArrowRight, FileCheck, Loader2, Wand2 } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/ui/atoms/Button/Button';

// Hooks & Context
import { useNotify } from '@/hooks/useNotify';
import { useTheme } from '@/contexts/theme/ThemeContext';

// Services & Utils
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/utils/cn';
import { sanitizeHtml } from '@/utils/sanitize';

export const CaseListClosing: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklist, setChecklist] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await GeminiService.generateDraft(
        "Create a comprehensive closing binder index for a standard civil litigation case including pleadings, discovery, and final judgment.",
        "Closing Index"
      );
      setChecklist(result);
      notify.success("Closing index generated via AI.");
    } catch {
      notify.error("Failed to generate index.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("rounded-lg border p-12 text-center h-full flex flex-col items-center justify-center", theme.surface.default, theme.border.default)}>
      <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4", theme.surface.highlight)}>
        <FileCheck className={cn("h-10 w-10", theme.text.tertiary)} />
      </div>
      <h3 className={cn("text-xl font-medium", theme.text.primary)}>Closing Binder Generator</h3>
      <p className={cn("max-w-sm mx-auto mt-2 mb-6", theme.text.secondary)}>Compile all final pleadings, orders, and executed agreements into a searchable PDF binder.</p>

      {checklist ? (
        <div className="w-full max-w-md bg-slate-50 p-4 rounded border text-left text-sm overflow-y-auto max-h-64 mb-4">
          <h4 className="font-bold mb-2 text-slate-700">Proposed Index:</h4>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(checklist) }} />
          <Button className="w-full mt-4" variant="outline" onClick={() => setChecklist(null)}>Reset</Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="primary" icon={ArrowRight} onClick={() => notify.info("Manual binder flow started.")}>Start New Binder</Button>
          <Button variant="secondary" icon={isGenerating ? Loader2 : Wand2} onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'AI Working...' : 'AI Auto-Index'}
          </Button>
        </div>
      )}
    </div>
  );
};
