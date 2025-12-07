
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

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md";
  
  const variants = {
    primary: cn(theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover, "shadow-sm focus:ring-blue-500 border border-transparent"),
    secondary: cn(theme.surface, theme.text.secondary, `hover:${theme.surfaceHighlight}`, theme.border.default, "border shadow-sm focus:ring-slate-200", `hover:${theme.text.primary}`),
    outline: cn("bg-transparent", theme.primary.text, theme.primary.border, `border hover:${theme.primary.light} focus:ring-blue-500`),
    ghost: cn("bg-transparent", theme.text.secondary, `hover:${theme.surfaceHighlight} hover:${theme.text.primary} border border-transparent`),
    danger: cn(theme.surface, theme.status.error.text, theme.status.error.border, `border hover:${theme.status.error.bg} focus:ring-red-500`),
    link: cn("bg-transparent underline-offset-4 hover:underline text-blue-600 p-0 h-auto border-none shadow-none")
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2" 
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2')} />
      ) : Icon ? (
        <Icon className={cn("h-4 w-4", children ? 'mr-2' : '')} />
      ) : null}
      {children}
    </button>
  );
};
