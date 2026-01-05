
import React from 'react';

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
  return (
    <div className={`flex-1 flex flex-col md:flex-row bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-0 ${className}`}>
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-slate-50 h-full ${showSidebarOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {sidebar}
      </div>
      <div className={`flex-1 flex flex-col min-w-0 h-full ${!showSidebarOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {content}
      </div>
    </div>
  );
};
