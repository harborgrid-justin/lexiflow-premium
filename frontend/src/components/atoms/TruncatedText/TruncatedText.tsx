/**
 * @module components/common/primitives/TruncatedText
 * @category Common Components - UI Primitives
 * @description Text with truncation and tooltip showing full content
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TruncatedTextProps {
  text: string;
  limit?: number;
  className?: string;
}

/**
 * TruncatedText - React 18 optimized with React.memo
 */
export const TruncatedText = React.memo<TruncatedTextProps>(({ 
  text, 
  limit = 50, 
  className = "" 
}) => {
  if (text.length <= limit) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span className={cn("cursor-help", className)} title={text}>
      {text.substring(0, limit)}...
    </span>
  );
});
