/**
 * @module components/common/layout/SectionTitle
 * @category Common Components - Typography
 * @description Standard sidebar/card section header typography
 */

import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className }) => {
  const { theme } = useTheme();
  
  return (
    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary, className)}>
      {children}
    </h4>
  );
};
