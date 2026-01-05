import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { Briefcase, File, FileText, Scale } from 'lucide-react';

interface Step1TemplateSelectionProps {
  onSelectTemplate: (templateName: string) => void;
}

export function Step1TemplateSelection({ onSelectTemplate }: Step1TemplateSelectionProps) {
  const { theme } = useTheme();

  const templates = [
    { name: 'Motion to Dismiss', icon: Scale, description: 'Standard motion to dismiss based on 12(b)(6).' },
    { name: 'Demand Letter', icon: FileText, description: 'Formal demand for payment or action.' },
    { name: 'Client Engagement', icon: Briefcase, description: 'New client engagement agreement.' },
    { name: 'Memo to File', icon: File, description: 'Internal memorandum regarding case status.' },
  ];

  return (
    <div className="space-y-4">
      <h4 className={cn("text-lg font-semibold", theme.text.primary)}>Select a Template</h4>
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
    </div>
  );
}
