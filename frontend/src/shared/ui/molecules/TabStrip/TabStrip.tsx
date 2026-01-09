/**
 * @module components/common/layout/TabStrip
 * @category Common Components - Layout
 * @description Navigation container used in module headers
 */

import React from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

export interface TabStripProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * TabStrip - React 18 optimized with React.memo
 */
export const TabStrip = React.memo<TabStripProps>(({ children, className }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default, className)}>
      {children}
    </div>
  );
});
