/**
 * @module components/common/primitives/LoadingSpinner
 * @category Common Components - UI Primitives
 * @description Simple loading spinner with optional text label
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { containerStyles, getSpinnerClass, textStyles } from './LoadingSpinner.styles';

export interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text, 
  className = "h-5 w-5" 
}) => (
  <div className={containerStyles}>
    <Loader2 className={getSpinnerClass(className)} />
    {text && <span className={textStyles}>{text}</span>}
  </div>
);
