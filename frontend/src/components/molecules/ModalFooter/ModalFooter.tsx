/**
 * @module components/common/layout/ModalFooter
 * @category Common Components - Layout
 * @description Standard bottom action bar for modals
 */

import React from 'react';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

export interface ModalFooterProps {
  children: React.ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn("flex justify-end gap-3 pt-4 border-t mt-4", theme.border.default)}>
      {children}
    </div>
  );
}
