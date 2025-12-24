
import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface GeneralSettingsProps {
  templateName: string;
  setTemplateName: (name: string) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ templateName, setTemplateName }) => {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
        <div className={cn("p-6 rounded-lg border space-y-4", theme.surface.default, theme.border.default)}>
            <h3 className={cn("font-bold text-lg border-b pb-2 mb-4", theme.text.primary, theme.border.default)}>General Configuration</h3>
            <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Template Name</label>
                <input 
                    className={cn("w-full px-3 py-2 rounded border outline-none focus:ring-2 focus:ring-blue-500", theme.background, theme.border.default, theme.text.primary)}
                    value={templateName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                />
            </div>
            <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Category</label>
                <select className={cn("w-full px-3 py-2 rounded border outline-none", theme.background, theme.border.default, theme.text.primary)}>
                    <option>Litigation</option>
                    <option>Corporate</option>
                    <option>Admin</option>
                </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="audit" className="rounded text-blue-600"/>
                <label htmlFor="audit" className={theme.text.primary}>Enable Full Audit Trail Logging</label>
            </div>
        </div>
    </div>
  );
};
