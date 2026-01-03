/**
 * @module components/common/layout/SectionTitle
 * @category Common Components - Typography
 * @description Standard sidebar/card section header typography
 */

import React from 'react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

export interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SectionTitle - React 18 optimized with React.memo
 */
export const SectionTitle = React.memo<SectionTitleProps>(({ children, className }) => {
  const { theme } = useTheme();
  
  return (
    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary, className)}>
      {children}
    </h4>
  );
});
