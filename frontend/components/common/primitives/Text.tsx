/**
 * @module components/common/primitives/Text
 * @category Common Components - UI Primitives
 * @description A typography component that handles text styling and variants.
 *
 * Provides consistent typography across the application with design system integration.
 */

import React from 'react';
import { cn } from '../../../utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
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
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-500',
    accent: 'text-purple-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const variantClasses = {
    body: '',
    heading: 'font-semibold',
    caption: 'text-sm text-slate-500',
    label: 'font-medium text-slate-700',
  };

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