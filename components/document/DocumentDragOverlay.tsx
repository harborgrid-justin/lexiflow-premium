
import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const DocumentDragOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "absolute inset-0 z-50 border-4 border-dashed rounded-lg flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm transition-all duration-200",
      // Inject opacity into the bg class (assumes tailwind structure like bg-blue-50)
      theme.primary.light.replace('bg-', 'bg-opacity-90 bg-'), 
      theme.primary.border
    )}>
      <UploadCloud className={cn("h-20 w-20 mb-4 animate-bounce", theme.primary.text)}/>
      <h3 className={cn("text-2xl font-bold", theme.primary.text)}>Drop files to upload</h3>
      <p className={cn(theme.primary.text)}>Secure Ingestion Pipeline Ready</p>
    </div>
  );
};
