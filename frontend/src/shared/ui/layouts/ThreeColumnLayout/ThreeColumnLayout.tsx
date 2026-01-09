/**
 * @module components/layouts/ThreeColumnLayout
 * @category Layouts
 * @description Three-column layout for complex multi-panel interfaces.
 * Ideal for advanced workflows with navigation, content, and detail panels.
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';

interface ThreeColumnLayoutProps {
  leftColumn: React.ReactNode;
  centerColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftWidth?: 'sm' | 'md' | 'lg';
  rightWidth?: 'sm' | 'md' | 'lg';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  showOnMobile?: 'center' | 'all';
  className?: string;
}

const columnWidthClasses = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export const ThreeColumnLayout = React.memo<ThreeColumnLayoutProps>(({
  leftColumn,
  centerColumn,
  rightColumn,
  leftWidth = 'md',
  rightWidth = 'md',
  gap = 'md',
  showOnMobile = 'center',
  className = '',
}) => {
  return (
    <div className={cn("flex h-full", gapClasses[gap], className)}>
      <div className={cn(
        "flex flex-col overflow-auto",
        columnWidthClasses[leftWidth],
        showOnMobile === 'all' ? 'flex' : 'hidden lg:flex'
      )}>
        {leftColumn}
      </div>
      <div className="flex-1 flex flex-col overflow-auto">
        {centerColumn}
      </div>
      <div className={cn(
        "flex flex-col overflow-auto",
        columnWidthClasses[rightWidth],
        showOnMobile === 'all' ? 'flex' : 'hidden xl:flex'
      )}>
        {rightColumn}
      </div>
    </div>
  );
});

ThreeColumnLayout.displayName = 'ThreeColumnLayout';
