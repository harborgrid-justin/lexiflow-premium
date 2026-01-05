
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)]";
  
  // Using style injection for dynamic colors where Tailwind classes might not suffice for var() usage
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-textMuted)',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-error)',
      border: '1px solid var(--color-error)',
    }
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  // We merge style props with specific variant styles
  const buttonStyle = variantStyles[variant];

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${className} hover:opacity-90 active:scale-95`} 
      style={buttonStyle}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
};
