/**
 * @module components/common/Modal
 * @category Common Components
 * @description Modal dialog wrapper around Shadcn Dialog
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/shadcn/dialog";
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ModalProps {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Callback when the modal is closed. */
  onClose: () => void;
  /** Modal title. */
  title: React.ReactNode;
  /** Modal content. */
  children: React.ReactNode;
  /** Modal size variant. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional CSS classes. */
  className?: string;
  /** Optional footer content. */
  footer?: React.ReactNode;
  /** Whether clicking backdrop closes modal. */
  closeOnBackdrop?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Modal({
  isOpen, onClose, title, children, size = 'md', className = '', footer, closeOnBackdrop = true
}: ModalProps) {

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className={cn(sizeClasses[size], className)}
        onInteractOutside={(e) => { if (!closeOnBackdrop) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* Shadcn Dialog requires a Description for accessibility, if title is present but no description, we can hide it or provide context */}
          <DialogDescription className="sr-only">
            Modal Content
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {children}
        </div>

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
