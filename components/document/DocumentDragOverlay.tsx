
import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const DocumentDragOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95",
      "bg-blue-500/10 border-4 border-blue-500 border-dashed m-4 rounded-xl"
    )}>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-full shadow-2xl mb-4 animate-bounce">
         <UploadCloud className="h-16 w-16 text-blue-600"/>
      </div>
      <h3 className={cn("text-3xl font-bold drop-shadow-sm", theme.text.primary)}>Drop files to upload</h3>
      <p className={cn("mt-2 text-lg font-medium", theme.text.secondary)}>Secure Ingestion Pipeline Ready</p>
    </div>
  );
};
