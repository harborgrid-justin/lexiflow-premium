/**
 * @module components/common/layout/CentredLoader
 * @category Common Components - Loading States
 * @description Full-container centered loading spinner with optional message
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { containerStyles, spinnerStyles, messageStyles } from './CentredLoader.styles';

export interface CentredLoaderProps {
  className?: string;
  message?: string;
}

export const CentredLoader: React.FC<CentredLoaderProps> = ({ className, message }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(containerStyles, className)}>
      <Loader2 className={spinnerStyles(theme)}/>
      {message && <span className={messageStyles(theme)}>{message}</span>}
    </div>
  );
};
