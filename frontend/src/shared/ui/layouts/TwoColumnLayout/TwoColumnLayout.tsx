/**
 * @module components/layouts/TwoColumnLayout
 * @category Layouts
 * @description Two-column layout for side-by-side content display.
 * Ideal for comparisons, editing workflows, and dual-panel interfaces.
 */

import React from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

interface TwoColumnLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftWidth?: 'equal' | '1/3' | '2/3' | '1/4' | '3/4';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  stackOnMobile?: boolean;
  className?: string;
}

const widthClasses = {
  equal: 'md:w-1/2',
  '1/3': 'md:w-1/3',
  '2/3': 'md:w-2/3',
  '1/4': 'md:w-1/4',
  '3/4': 'md:w-3/4',
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftColumn,
  rightColumn,
  leftWidth = 'equal',
  gap = 'md',
  stackOnMobile = true,
  className = '',
}) => {
  const { theme: _theme } = useTheme();

  return (
    <div className={cn(
      "flex h-full",
      stackOnMobile ? 'flex-col md:flex-row' : 'flex-row',
      gapClasses[gap],
      className
    )}>
      <div className={cn(
        "flex flex-col overflow-auto",
        stackOnMobile ? 'w-full' : widthClasses[leftWidth],
        widthClasses[leftWidth]
      )}>
        {leftColumn}
      </div>
      <div className={cn(
        "flex flex-col overflow-auto",
        stackOnMobile ? 'w-full' : 'flex-1',
        'flex-1'
      )}>
        {rightColumn}
      </div>
    </div>
  );
};
