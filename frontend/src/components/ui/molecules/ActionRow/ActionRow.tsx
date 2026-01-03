/**
 * @module components/common/layout/ActionRow
 * @category Common Components - Layout
 * @description Header pattern for modules with title, description, and actions
 */

import React from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

export interface ActionRowProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ActionRow = React.memo<ActionRowProps>(({ title, subtitle, children, className }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between items-center p-4 rounded-lg border shadow-sm gap-4", 
      theme.surface.default, 
      theme.border.default, 
      className
    )}>
      <div>
        <h3 className={cn("font-bold text-lg", theme.text.primary)}>{title}</h3>
        {subtitle && <p className={cn("text-sm", theme.text.secondary)}>{subtitle}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
});

ActionRow.displayName = 'ActionRow';
