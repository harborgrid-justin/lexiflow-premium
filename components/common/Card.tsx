
import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false, 
  title, 
  subtitle,
  action,
  footer
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      theme.surface, 
      theme.border.default, 
      "rounded-lg border shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col",
      className
    )}>
      {(title || action) && (
        <div className={cn("px-5 py-4 border-b flex justify-between items-start shrink-0", theme.surface, theme.border.light)}>
          <div className="min-w-0 flex-1 mr-4">
            {title && <h3 className={cn("text-base font-semibold leading-tight truncate", theme.text.primary)}>{title}</h3>}
            {subtitle && <p className={cn("text-xs mt-1 truncate", theme.text.secondary)}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}
      
      <div className={cn("flex-1", noPadding ? '' : 'p-5')}>
        {children}
      </div>
      
      {footer && (
        <div className={cn("px-5 py-3 border-t text-sm shrink-0", theme.surfaceHighlight, theme.border.light, theme.text.secondary)}>
          {footer}
        </div>
      )}
    </div>
  );
};
