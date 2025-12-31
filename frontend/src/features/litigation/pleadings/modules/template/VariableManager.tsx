
import React from 'react';
import { Variable, Database, RefreshCw } from 'lucide-react';
import { PleadingVariable } from '@/types';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

interface VariableManagerProps {
  variables: PleadingVariable[];
  onUpdateVariable: (id: string, value: string) => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({ variables, onUpdateVariable }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center justify-between p-3 rounded-lg border", theme.surface.highlight, theme.border.default)}>
        <h4 className={cn("text-xs font-bold uppercase flex items-center", theme.text.secondary)}>
          <Variable className="h-3 w-3 mr-2" /> Dynamic Fields
        </h4>
        <button className={cn("p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700", theme.text.tertiary)}>
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-3">
        {variables.map((variable) => (
          <div key={variable.id} className={cn("p-3 rounded border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between mb-1">
              <span className={cn("text-xs font-mono font-medium", theme.primary.text)}>{`{{${variable.key}}}`}</span>
              <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded text-slate-500", theme.surface.highlight)}>{variable.source}</span>
            </div>
            <p className={cn("text-xs mb-2", theme.text.secondary)}>{variable.label}</p>
            <div className="relative">
              <input
                className={cn("w-full text-sm p-2 border rounded outline-none focus:ring-1 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                value={variable.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateVariable(variable.id, e.target.value)}
                placeholder="No value set"
              />
              {variable.source !== 'Manual' && (
                <Database className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              )}
            </div>
          </div>
        ))}
        
        {variables.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            No variables detected in this template.
          </div>
        )}
      </div>
    </div>
  );
};
