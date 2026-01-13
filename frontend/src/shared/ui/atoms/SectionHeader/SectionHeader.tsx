/**
 * @module components/common/primitives/SectionHeader
 * @category Common Components - UI Primitives
 * @description Section header with title, subtitle, and optional action button
 */

import React, { useId } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * SectionHeader - React 18 optimized with React.memo and useId
 */
export const SectionHeader = React.memo<SectionHeaderProps>(({ 
  title, 
  subtitle, 
  action 
}) => {
  // Use Tailwind classes directly for theming
  const headingId = useId();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 id={headingId} className={cn("font-bold text-sm uppercase tracking-wide text-text", title && "mb-0")}>
          {title}
        </h3>
        {subtitle && (
          <p aria-describedby={headingId} className={cn("text-xs mt-0.5 text-text-muted")}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
});
