/**
 * @module components/common/primitives/Text
 * @category Common Components - UI Primitives
 * @description A typography component that handles text styling and variants.
 *
 * Provides consistent typography across the application with design system integration.
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { sizeClasses, weightClasses, colorClasses, alignClasses, variantClasses } from './Text.styles';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text variant */
  variant?: 'body' | 'heading' | 'caption' | 'label';
  /** Text size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Text weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Element type */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  size = 'md',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  as: Component = 'span',
  className,
  children,
  ...props
}) => {
  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    variantClasses[variant],
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
