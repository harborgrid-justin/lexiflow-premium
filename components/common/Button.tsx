
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ElementType;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-md gap-2 border shadow-sm";
  
  // Mapping variants to the new semantic tokens in 'action'
  const variants = {
    primary: cn(theme.action.primary.bg, theme.action.primary.text, theme.action.primary.hover, theme.action.primary.border, "focus:ring-blue-500"),
    secondary: cn(theme.action.secondary.bg, theme.action.secondary.text, theme.action.secondary.hover, theme.action.secondary.border, "focus:ring-slate-200"),
    // Outline maps to secondary but with specific border emphasis if needed, or re-use secondary logic
    outline: cn("bg-transparent shadow-none", theme.primary.text, theme.primary.border, `hover:${theme.surface.highlight} focus:ring-blue-500`),
    ghost: cn(theme.action.ghost.bg, theme.action.ghost.text, theme.action.ghost.hover, "border-transparent shadow-none focus:ring-slate-200"),
    danger: cn(theme.action.danger.bg, theme.action.danger.text, theme.action.danger.hover, theme.action.danger.border, "focus:ring-red-500"),
    link: cn("bg-transparent underline-offset-4 hover:underline text-blue-600 p-0 h-auto border-none shadow-none gap-1")
  };

  const sizes = {
    xs: "h-7 px-2 text-[10px] gap-1.5",
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-3",
    icon: "h-9 w-9 p-0 gap-0 flex items-center justify-center"
  };

  const iconSize = size === 'xs' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", iconSize)} />
      ) : Icon ? (
        <Icon className={cn(iconSize, children ? '' : '')} />
      ) : null}
      {children}
    </button>
  );
};