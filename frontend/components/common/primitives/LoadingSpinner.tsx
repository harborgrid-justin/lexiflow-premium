/**
 * @module components/common/primitives/LoadingSpinner
 * @category Common Components - UI Primitives
 * @description Simple loading spinner with optional text label
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text, 
  className = "h-5 w-5" 
}) => (
  <div className="flex items-center justify-center text-slate-500">
    <Loader2 className={cn("animate-spin", className)} />
    {text && <span className="ml-2 text-sm">{text}</span>}
  </div>
);
