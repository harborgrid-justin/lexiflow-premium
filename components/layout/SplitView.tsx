
import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface SplitViewProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  showSidebarOnMobile?: boolean;
  className?: string;
}

export const SplitView: React.FC<SplitViewProps> = ({ 
  sidebar, 
  content, 
  showSidebarOnMobile = true, 
  className = '' 
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex-1 flex flex-col md:flex-row rounded-lg overflow-hidden min-h-0",
      theme.surface.default,
      theme.border.default,
      "border shadow-sm",
      className
    )}>
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col h-full border-r",
        theme.border.default,
        theme.surface.highlight,
        showSidebarOnMobile ? 'flex' : 'hidden md:flex'
      )}>
        {sidebar}
      </div>
      <div className={cn(
        "flex-1 flex flex-col min-w-0 h-full",
        theme.surface.default, // Replaced bg-white
        !showSidebarOnMobile ? 'flex' : 'hidden md:flex'
      )}>
        {content}
      </div>
    </div>
  );
};
