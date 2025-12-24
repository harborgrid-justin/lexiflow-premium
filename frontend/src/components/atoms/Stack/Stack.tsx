/**
 * @module components/common/primitives/Stack
 * @category Common Components - UI Primitives
 * @description A layout component for stacking elements vertically or horizontally.
 *
 * Provides consistent spacing and alignment for stacked layouts.
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { directionClasses, spacingClasses, alignClasses, justifyClasses } from './Stack.styles';

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
