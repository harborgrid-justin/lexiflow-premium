/**
 * @module components/common/primitives/LoadingSpinner
 * @category Common Components - UI Primitives
 * @description Simple loading spinner with optional text label
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { containerStyles, getSpinnerClass, textStyles } from './LoadingSpinner.styles';

export interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

/**
 * LoadingSpinner - React 18 optimized with React.memo
 */
export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ 
  text, 
  className = "h-5 w-5" 
}) => (
  <div className={containerStyles}>
    <Loader2 className={getSpinnerClass(className)} aria-label={text || "Loading"} />
    {text && <span className={textStyles}>{text}</span>}
  </div>
));
