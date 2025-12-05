
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className={`max-w-7xl mx-auto space-y-6 animate-fade-in ${className}`}>
        {children}
      </div>
    </div>
  );
};
