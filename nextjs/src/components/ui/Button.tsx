'use client';

/**
 * Button Component - Reusable button with variants
 * Supports multiple sizes, variants, and states
 */

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 active:bg-blue-800 disabled:bg-blue-400',
  secondary:
    'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 disabled:bg-slate-100',
  outline:
    'border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100',
  ghost:
    'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200',
  danger:
    'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 active:bg-red-800 disabled:bg-red-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-6 py-3 text-base font-medium rounded-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {icon && iconPosition === 'left' && !loading && icon}
      {children}
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
}
