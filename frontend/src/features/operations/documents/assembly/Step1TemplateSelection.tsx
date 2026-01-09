import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { Briefcase, File, FileText, Loader2, Scale } from 'lucide-react';

interface Step1TemplateSelectionProps {
  onSelectTemplate: (templateName: string) => void;
}

export function Step1TemplateSelection({ onSelectTemplate }: Step1TemplateSelectionProps) {
  const { theme } = useTheme();

  const { data: fetchedTemplates = [], isLoading } = useQuery(
    ['drafting', 'templates', 'all'],
    async () => {
      try {
        return await DataService.drafting.getAllTemplates();
      } catch (e) {
        console.error("Failed to fetch templates", e);
        return [];
      }
    }
  );

  const getIconForTemplate = (name: string, category?: string) => {
    const term = (name + ' ' + (category || '')).toLowerCase();
    if (term.includes('motion') || term.includes('pleading')) return Scale;
    if (term.includes('letter') || term.includes('contract')) return FileText;
    if (term.includes('engagement') || term.includes('client')) return Briefcase;
    return File;
  };

  const templates = fetchedTemplates.map(t => ({
    name: t.name,
    icon: getIconForTemplate(t.name, t.category),
    description: t.description || 'No description available'
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className={cn("text-lg font-semibold", theme.text.primary)}>Select a Template</h4>
      {templates.length === 0 ? (
        <div className={cn("p-4 border rounded-lg text-center", theme.border.default, theme.text.secondary)}>
          No templates available. Create a template to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.name}
              onClick={() => onSelectTemplate(t.name)}
              className={cn(
                "flex flex-col items-start p-4 border rounded-lg transition-all hover:shadow-md text-left",
                theme.surface.default,
                theme.border.default,
                "hover:border-blue-500"
              )}
            >
              <div className="flex items-center mb-2">
                <t.icon className={cn("h-5 w-5 mr-2", theme.primary.text)} />
                <span className={cn("font-medium", theme.text.primary)}>{t.name}</span>
              </div>
              <p className={cn("text-sm", theme.text.secondary)}>{t.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
