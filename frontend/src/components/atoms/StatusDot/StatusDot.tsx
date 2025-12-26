/**
 * @module components/common/primitives/StatusDot
 * @category Common Components - UI Primitives
 * @description Status indicator dot with color mapping from StatusRegistry
 */

import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { StatusRegistry } from '@/utils/statusRegistry';

export interface StatusDotProps {
  status: string;
  size?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ 
  status, 
  size = "w-2.5 h-2.5", 
  className 
}) => {
  const { theme } = useTheme();
  const variant = StatusRegistry.getVariant(status);
  
  // Map variant to semantic theme colors
  let color = theme.status.neutral.bg; 
  if (variant === 'success') color = theme.status.success.bg;
  if (variant === 'warning') color = theme.status.warning.bg;
  if (variant === 'error') color = theme.status.error.bg;
  if (variant === 'info') color = theme.status.info.bg;

  return (
    <div 
      className={cn(
        size, 
        "rounded-full shrink-0 transition-colors duration-500", 
        color, 
        className
      )} 
      title={status} 
    />
  );
};
