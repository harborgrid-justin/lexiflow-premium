/**
 * @module components/layouts/CenteredLayout
 * @category Layouts
 * @description Centered content layout for auth pages, empty states, and focused content.
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';

interface CenteredLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  verticalCenter?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  children,
  maxWidth = 'md',
  verticalCenter = true,
  className = '',
}) => {
  return (
    <div className={cn(
      "flex w-full h-full p-6",
      verticalCenter ? 'items-center' : 'items-start pt-20',
      "justify-center",
      className
    )}>
      <div className={cn("w-full", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
};
