/**
 * @module components/common/layout/CentredLoader
 * @category Common Components - Loading States
 * @description Full-container centered loading spinner with optional message
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export interface CentredLoaderProps {
  className?: string;
  message?: string;
}

export const CentredLoader: React.FC<CentredLoaderProps> = ({ className, message }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("flex h-full w-full items-center justify-center p-8 flex-col gap-2", className)}>
      <Loader2 className={cn("animate-spin h-8 w-8", theme.primary.text)}/>
      {message && <span className={cn("text-xs", theme.text.secondary)}>{message}</span>}
    </div>
  );
};
