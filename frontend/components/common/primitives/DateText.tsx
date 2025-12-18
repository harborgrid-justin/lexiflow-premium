/**
 * @module components/common/primitives/DateText
 * @category Common Components - UI Primitives
 * @description Formatted date display with optional calendar icon
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Formatters } from '../../../utils/formatters';

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
    <span className={cn("flex items-center text-xs", theme.text.secondary, className)}>
      {icon && <Calendar className="h-3 w-3 mr-1 opacity-70" />}
      {Formatters.date(date)}
    </span>
  );
};
