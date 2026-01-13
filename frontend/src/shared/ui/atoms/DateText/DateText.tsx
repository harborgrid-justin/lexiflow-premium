/**
 * @module components/common/primitives/DateText
 * @category Common Components - UI Primitives
 * @description Formatted date display with optional calendar icon
 */

import { Calendar } from 'lucide-react';
import React from 'react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Formatters } from '@/utils/formatters';
import { containerStyles, iconStyles } from './DateText.styles';

export interface DateTextProps {
  date: string;
  className?: string;
  icon?: boolean;
}

/**
 * DateText - React 18 optimized with React.memo
 */
export const DateText = React.memo<DateTextProps>(({ 
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
});
