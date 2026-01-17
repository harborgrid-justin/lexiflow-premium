import { Plus } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/cn';
interface BuilderCanvasProps {
  className?: string;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ className }) => {
  return (
    <div className={cn("bg-slate-50 dark:bg-slate-900/50 p-8 overflow-auto h-full", className)}>
      <div className="w-full max-w-4xl mx-auto min-h-[600px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-4 bg-white/50 dark:bg-slate-950/50">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Plus className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="font-medium text-slate-900 dark:text-slate-200">Start Building</h3>
          <p className="text-sm mt-1">Drag and drop elements from the toolbar</p>
        </div>
      </div>
    </div>
  );
};
