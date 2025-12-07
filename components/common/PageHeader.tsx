
import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, className }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6", className)}>
      <div className="min-w-0 flex-1">
        <h2 className={cn("text-2xl font-bold tracking-tight leading-tight", theme.text.primary)}>{title}</h2>
        {subtitle && <p className={cn("mt-1 text-sm", theme.text.secondary)}>{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};