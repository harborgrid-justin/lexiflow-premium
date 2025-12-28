/**
 * @module components/layouts/PageContainer
 * @category Layouts
 * @description Simple page container with responsive max-width and consistent spacing.
 * Ideal for standard content pages that need scrolling and centered content.
 */

import React from 'react';

interface PageContainerLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainerLayout: React.FC<PageContainerLayoutProps> = ({ 
  children, 
  className = '', 
  maxWidth = '7xl' 
}) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto space-y-6 animate-fade-in ${className}`}>
        {children}
      </div>
    </div>
  );
};
