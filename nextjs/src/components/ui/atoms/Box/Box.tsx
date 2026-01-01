/**
 * @module components/common/primitives/Box
 * @category Common Components - UI Primitives
 * @description A flexible container component that handles spacing, colors, and layout.
 *
 * This is the foundational primitive for layout and styling. It provides a clean
 * abstraction over div elements with design system integration.
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { 
  spacingClasses, 
  bgClasses, 
  roundedClasses, 
  shadowClasses, 
  justifyClasses, 
  alignClasses, 
  gapClasses 
} from './Box.styles';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
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

export function Box({
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
}: BoxProps) {
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
}
