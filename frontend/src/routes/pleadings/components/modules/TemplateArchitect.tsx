import React, { useState } from 'react';
import { LayoutTemplate, Settings, Sliders } from 'lucide-react';
import { VariableManager } from './template/VariableManager';
import { JurisdictionRules } from './template/JurisdictionRules';
import { PleadingVariable } from '@/types';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

interface TemplateArchitectProps {
  variables?: PleadingVariable[];
  jurisdiction?: string;
  onUpdateVariable: (id: string, value: string) => void;
}

export const TemplateArchitect: React.FC<TemplateArchitectProps> = ({ variables = [], jurisdiction, onUpdateVariable }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'variables' | 'rules'>('variables');

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b flex items-center justify-between", theme.border.default)}>
        <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
          <LayoutTemplate className="h-4 w-4 mr-2" /> Template Architect
        </h3>
        <div className={cn("flex p-0.5 rounded-lg", theme.surface.highlight)}>
           <button
             onClick={() => setActiveTab('variables')}
             className={cn("p-1.5 rounded-md transition-colors", activeTab === 'variables' ? cn(theme.surface.default, "shadow text-blue-600") : "text-slate-500")}
             title="Variables"
            >
             <Sliders className="h-3.5 w-3.5" />
           </button>
           <button
             onClick={() => setActiveTab('rules')}
             className={cn("p-1.5 rounded-md transition-colors", activeTab === 'rules' ? cn(theme.surface.default, "shadow text-blue-600") : "text-slate-500")}
             title="Jurisdiction Rules"
            >
             <Settings className="h-3.5 w-3.5" />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'variables' ? (
          <VariableManager variables={variables} onUpdateVariable={onUpdateVariable} />
        ) : (
          <JurisdictionRules jurisdiction={jurisdiction} />
        )}
      </div>
    </div>
  );
};
