
import React from 'react';
import { PageHeader } from './PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ManagerLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filterPanel?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ 
  title, subtitle, actions, filterPanel, children, sidebar, className 
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background, className)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title={title} 
          subtitle={subtitle}
          actions={actions}
        />
        {filterPanel && (
            <div className="mb-4">
                {filterPanel}
            </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
            <div className={cn("w-64 border-r flex flex-col shrink-0 hidden md:flex", theme.border.default, theme.surfaceHighlight)}>
                {sidebar}
            </div>
        )}
        <div className={cn("flex-1 overflow-y-auto custom-scrollbar p-6", theme.surface)}>
            {children}
        </div>
      </div>
    </div>
  );
};
