/**
 * @module components/common/layout/SectionTitle
 * @category Common Components - Typography
 * @description Standard sidebar/card section header typography
 */

import { cn } from '@/lib/cn';
import React from "react";

export interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SectionTitle - React 18 optimized with React.memo
 */
export const SectionTitle = React.memo<SectionTitleProps>(({ children, className }) => {
  // Use Tailwind classes directly for theming instead of JS object values which are hex codes
  return (
    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3 text-text-muted", className)}>
      {children}
    </h4>
  );
});
