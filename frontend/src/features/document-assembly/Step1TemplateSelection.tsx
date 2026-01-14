import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Loader2 } from 'lucide-react';
import { useDocumentTemplates } from './hooks/useDocumentTemplates';

interface Step1TemplateSelectionProps {
  onSelectTemplate: (templateName: string) => void;
}

export function Step1TemplateSelection({ onSelectTemplate }: Step1TemplateSelectionProps) {
  const { theme } = useTheme();
  const { templates, isLoading } = useDocumentTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={cn("w-8 h-8 animate-spin", theme.text.secondary)} />
        <span className={cn("ml-3", theme.text.secondary)}>Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>Select Document Template</h2>
        <p className={theme.text.secondary}>
          Choose a template to start generating your legal document. Each template includes structure and legal language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.name}
              onClick={() => onSelectTemplate(template.name)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:shadow-md",
                theme.border.default,
                theme.surface.raised,
                "hover:border-blue-500 dark:hover:border-blue-400"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("font-semibold", theme.text.primary)}>{template.name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      "bg-slate-100 dark:bg-slate-800",
                      theme.text.tertiary
                    )}>
                      {template.category}
                    </span>
                  </div>
                  <p className={cn("text-sm", theme.text.secondary)}>
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={cn(
        "p-4 rounded-lg border",
        "bg-blue-50 dark:bg-blue-950/20",
        "border-blue-200 dark:border-blue-800"
      )}>
        <p className={cn("text-sm", theme.text.secondary)}>
          <strong className={theme.text.primary}>Tip:</strong> After selecting a template, you'll configure specific details
          and our AI will generate a customized draft based on your case information.
        </p>
      </div>
    </div>
  );
};
