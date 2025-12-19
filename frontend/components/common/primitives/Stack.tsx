/**
 * @module components/common/primitives/Stack
 * @category Common Components - UI Primitives
 * @description A layout component for stacking elements vertically or horizontally.
 *
 * Provides consistent spacing and alignment for stacked layouts.
 */

import React from 'react';
import { cn } from '../../../utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Spacing between items */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Alignment along the cross axis */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify content along the main axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Wrap items */
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...props
}) => {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  };

  const spacingClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
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
    evenly: 'justify-evenly',
  };

  const classes = cn(
    'flex',
    directionClasses[direction],
    spacingClasses[spacing],
    alignClasses[align],
    justifyClasses[justify],
    wrap && 'flex-wrap',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};