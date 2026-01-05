
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-full flex flex-col space-y-6 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};
