/**
 * @module components/common/primitives/Box
 * @category Common Components - UI Primitives
 * @description A flexible container component that handles spacing, colors, and layout.
 *
 * This is the foundational primitive for layout and styling. It provides a clean
 * abstraction over div elements with design system integration.
 */

import React from 'react';
import { cn } from '../../../utils/cn';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing preset from design system */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Background color preset */
  bg?: 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
  /** Border radius preset */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Shadow preset */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Display flex */
  flex?: boolean;
  /** Flex direction */
  direction?: 'row' | 'col';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Gap between children */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Box: React.FC<BoxProps> = ({
  spacing = 'none',
  bg,
  rounded = 'none',
  shadow = 'none',
  flex = false,
  direction = 'row',
  justify,
  align,
  gap,
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    none: '',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const bgClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-slate-100 text-slate-900',
    muted: 'bg-slate-50 text-slate-700',
    accent: 'bg-purple-600 text-white',
    danger: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const classes = cn(
    spacingClasses[spacing],
    bg && bgClasses[bg],
    roundedClasses[rounded],
    shadowClasses[shadow],
    flex && 'flex',
    flex && direction === 'col' && 'flex-col',
    justify && justifyClasses[justify],
    align && alignClasses[align],
    gap && gapClasses[gap],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};