
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
    secondary: cn(theme.action.secondary.bg, theme.action.secondary.text, theme.action.secondary.hover, theme.action.secondary.border, "focus:ring-slate-500"),
    outline: cn("bg-transparent border", theme.border.default, theme.text.primary, `hover:${theme.surfaceHighlight}`, "focus:ring-slate-500"),
    ghost: cn(theme.action.ghost.bg, theme.action.ghost.text, theme.action.ghost.hover, "border-transparent shadow-none"),
    danger: cn(theme.action.danger.bg, theme.action.danger.text, theme.action.danger.hover, theme.action.danger.border, "focus:ring-rose-500"),
    link: "text-blue-600 hover:underline bg-transparent border-none shadow-none p-0 h-auto"
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {Icon && !isLoading && <Icon className={cn("h-4 w-4", children ? "mr-0" : "")} />}
      {children}
    </button>
  );
};
