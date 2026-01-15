/**
 * @module components/common/layout/InfoGrid
 * @category Common Components - Layout
 * @description Key-value grid layout for inspectors and detail views
 */

import React from 'react';
import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';

export interface InfoGridItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

export interface InfoGridProps {
  items: InfoGridItem[];
  cols?: number;
}

export const InfoGrid = React.memo<InfoGridProps>(({ items, cols = 2 }) => {
  const { theme } = useTheme();

  return (
    <div className={`grid grid-cols-${cols} gap-4`}>
      {/* IDENTITY-STABLE KEYS: Use label as key for stable reconciliation */}
      {items.map((item) => (
        <div key={item.label} className={item.span ? `col-span-${item.span}` : ''}>
          <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>
            {item.label}
          </p>
          <div className={cn("text-sm font-medium break-words", theme.text.primary)}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
});

InfoGrid.displayName = 'InfoGrid';
