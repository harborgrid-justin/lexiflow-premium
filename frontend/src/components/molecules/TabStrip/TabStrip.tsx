/**
 * @module components/common/layout/TabStrip
 * @category Common Components - Layout
 * @description Navigation container used in module headers
 */

import React from 'react';

import { cn } from '@/lib/cn';

export interface TabStripProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * TabStrip - React 18 optimized with React.memo
 */
export const TabStrip = React.memo<TabStripProps>(({ children, className }) => {
  // Use Tailwind classes directly
  
  return (
    <div className={cn("px-6 pt-6 border-b border-border shrink-0", className)}>
      {children}
    </div>
  );
});
