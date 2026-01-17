import { ArrowRight, Database, LayoutTemplate, MousePointer2, Save, Square, Type } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/cn';
interface BuilderToolbarProps {
  className?: string;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({ className }) => {
  const tools = [
    { icon: MousePointer2, label: 'Select' },
    { icon: LayoutTemplate, label: 'Form' },
    { icon: Type, label: 'Text' },
    { icon: Square, label: 'Section' },
    { icon: Database, label: 'Data Field' },
    { icon: ArrowRight, label: 'Connector' },
  ];

  return (
    <div className={cn("h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 justify-between", className)}>
      <div className="flex items-center gap-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 border px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
          Preview
        </button>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          <Save className="w-4 h-4" />
          Save Workflow
        </button>
      </div>
    </div>
  );
};
