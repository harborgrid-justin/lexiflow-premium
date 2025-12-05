
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className={cn("p-4 rounded-full mb-4 border", theme.surfaceHighlight, theme.border.default)}>
        <Icon className={cn("h-8 w-8 opacity-50", theme.text.tertiary)} />
      </div>
      <h3 className={cn("text-lg font-medium mb-1", theme.text.primary)}>{title}</h3>
      <p className={cn("text-sm max-w-sm mb-6", theme.text.secondary)}>{description}</p>
      {action}
    </div>
  );
};
