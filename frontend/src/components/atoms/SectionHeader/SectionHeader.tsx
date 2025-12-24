/**
 * @module components/common/primitives/SectionHeader
 * @category Common Components - UI Primitives
 * @description Section header with title, subtitle, and optional action button
 */

import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  action 
}) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.primary)}>
          {title}
        </h3>
        {subtitle && (
          <p className={cn("text-xs mt-0.5", theme.text.secondary)}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
};
