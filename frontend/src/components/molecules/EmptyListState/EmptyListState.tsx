/**
 * @module components/common/layout/EmptyListState
 * @category Common Components - Empty States
 * @description Consistent empty state messaging for lists and collections
 */

import React from 'react';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

export interface EmptyListStateProps {
  label: string;
  message?: string;
  icon?: React.ElementType;
}

/**
 * EmptyListState - React 18 optimized with React.memo
 */
export const EmptyListState = React.memo<EmptyListStateProps>(({ label, message, icon: Icon }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center h-full w-full", theme.text.tertiary)}>
      {Icon && <Icon className="h-12 w-12 mb-3 opacity-20"/>}
      <div className="font-medium italic text-sm">{label}</div>
      {message && <div className="text-xs mt-1 opacity-75">{message}</div>}
    </div>
  );
});
