/**
 * @module components/layouts/StackLayout
 * @category Layouts
 * @description Vertical or horizontal stack layout with consistent spacing.
 * Ideal for forms, toolbars, and linear content flow.
 */

import { cn } from '@/utils/cn';
import React, { memo } from 'react';

interface StackLayoutProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  className?: string;
}

const spacingClasses = {
  vertical: {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  horizontal: {
    none: 'space-x-0',
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const StackLayout = memo<StackLayoutProps>(({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
}) => {
  return (
    <div className={cn(
      "flex",
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      spacingClasses[direction][spacing],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  );
});

StackLayout.displayName = 'StackLayout';
