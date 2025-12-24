/**
 * @module components/common/primitives/DateText
 * @category Common Components - UI Primitives
 * @description Formatted date display with optional calendar icon
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Formatters } from '@/utils/formatters';
import { containerStyles, iconStyles } from './DateText.styles';

export interface DateTextProps {
  date: string;
  className?: string;
  icon?: boolean;
}

export const DateText: React.FC<DateTextProps> = ({ 
  date, 
  className = "", 
  icon = false 
}) => {
  const { theme } = useTheme();
  
  return (
    <span className={cn(containerStyles(theme), className)}>
      {icon && <Calendar className={iconStyles} />}
      {Formatters.date(date)}
    </span>
  );
};
