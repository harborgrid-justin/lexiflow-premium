/**
 * @module components/layouts/GridLayout
 * @category Layouts
 * @description Responsive grid layout for card-based interfaces.
 * Automatically adjusts columns based on screen size.
 */

import React from "react";

import { cn } from '@/lib/cn';

interface GridLayoutProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = 'md',
  autoFit = false,
  minItemWidth = '250px',
  className = '',
}) => {
  if (autoFit) {
    return (
      <div 
        className={cn("grid", gapClasses[gap], className)}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("grid", columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
};
