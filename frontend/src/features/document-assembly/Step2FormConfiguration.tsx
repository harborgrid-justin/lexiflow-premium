/**
 * @module components/document-assembly/Step2FormConfiguration
 * @description Form configuration step for document assembly wizard
 * ✅ Backend-ready with proper data handling (2025-12-21)
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { getTodayString } from '@/shared/lib/dateUtils';
import { Calendar, FileText, Sparkles, User } from 'lucide-react';
interface Step2FormConfigurationProps {
  template: string;
  formData: {
    recipient: string;
    date: string;
    mainPoint: string;
  };
  onFormDataChange: (data: { recipient: string; date: string; mainPoint: string }) => void;
  onGenerate: () => void;
}

export function Step2FormConfiguration({
  template,
  formData,
  onFormDataChange,
  onGenerate
}) => {
  const { theme } = useTheme();

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onFormDataChange({
      ...formData,
      [field]: e.target.value
    });
  };

  const isFormValid = formData.recipient && formData.mainPoint;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>
          Configure: {template}
        </h2>
        <p className={theme.text.secondary}>
          Provide the details needed to generate your customized document.
        </p>
      </div>

      <div className="space-y-4">
        {/* Recipient Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            <User className="inline-block w-4 h-4 mr-1" />
            Recipient / Opposing Party
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.recipient}
            onChange={handleChange('recipient')}
            placeholder="e.g., John Smith, ABC Corporation, Court of Appeals"
            className={cn(
              "w-full px-4 py-2 rounded-lg border",
              theme.border.default,
              theme.surface.input,
              theme.text.primary,
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500"
            )}
          />
        </div>

        {/* Date Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            <Calendar className="inline-block w-4 h-4 mr-1" />
            Document Date
          </label>
          <input
            type="date"
            value={formData.date || getTodayString()}
            onChange={handleChange('date')}
            placeholder="Select date"
            className={cn(
              "w-full px-4 py-2 rounded-lg border",
              theme.border.default,
              theme.surface.input,
              theme.text.primary,
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Main Point / Purpose */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            <FileText className="inline-block w-4 h-4 mr-1" />
            Main Point / Purpose
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={formData.mainPoint}
            onChange={handleChange('mainPoint')}
            placeholder="Describe the key arguments, facts, or objectives for this document..."
            rows={6}
            className={cn(
              "w-full px-4 py-2 rounded-lg border",
              theme.border.default,
              theme.surface.input,
              theme.text.primary,
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "resize-none"
            )}
          />
          <p className={cn("text-xs mt-1", theme.text.tertiary)}>
            Be specific about legal issues, facts, and desired outcomes. More detail = better results.
          </p>
        </div>
      </div>

      {/* Additional Context */}
      <div className={cn(
        "p-4 rounded-lg border",
        "bg-purple-50 dark:bg-purple-950/20",
        "border-purple-200 dark:border-purple-800"
      )}>
        <h4 className={cn("font-semibold mb-2 flex items-center", theme.text.primary)}>
          <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
          AI Enhancement Tips
        </h4>
        <ul className={cn("text-sm space-y-1", theme.text.secondary)}>
          <li>• Include relevant case law citations if known</li>
          <li>• Mention specific statutes or regulations</li>
          <li>• Provide key facts and timeline information</li>
          <li>• State your legal position clearly</li>
        </ul>
      </div>

      {/* Generate Button */}
      <div className={cn("flex gap-3 pt-4 border-t", theme.border.default)}>
        <button
          onClick={onGenerate}
          disabled={!isFormValid}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-semibold transition-all",
            "flex items-center justify-center gap-2",
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          )}
        >
          <Sparkles className="w-5 h-5" />
          Generate Draft with AI
        </button>
      </div>
    </div>
  );
};
