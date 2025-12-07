
import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const { theme } = useTheme();

  // Helper to safely access theme status colors
  const getVariantStyles = (v: string) => {
    switch (v) {
      case 'success': return cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
      case 'warning': return cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
      case 'error': return cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border);
      case 'info': return cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
      // Hardcoded purple handling or map to info/neutral if not in schema, but we'll add a custom one for now using raw colors for the specific 'purple' case or map to existing
      case 'purple': return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      default: return cn(theme.status.neutral.bg, theme.status.neutral.text, theme.status.neutral.border);
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center px-2.5 h-5 rounded-full text-[10px] font-bold border ring-1 ring-inset ring-black/5 uppercase tracking-wide whitespace-nowrap",
      getVariantStyles(variant),
      className
    )}>
      {children}
    </span>
  );
};