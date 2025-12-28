/**
 * @module components/common/ConfirmDialog
 * @category Common
 * @description Confirmation dialog with variants.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Modal } from '@/components/molecules/Modal/Modal';
import { Button } from '@/components/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmDialog - React 18 optimized with React.memo and useId
 */
export const ConfirmDialog = React.memo<ConfirmDialogProps>(function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger'
}) {
  const { theme } = useTheme();
  const dialogId = useId();
  const descriptionId = useId();

  const variantStyles = {
      danger: { bg: theme.status.error.bg, text: theme.status.error.text },
      warning: { bg: theme.status.warning.bg, text: theme.status.warning.text },
      info: { bg: theme.status.info.bg, text: theme.status.info.text }
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={cn("p-6", theme.surface.default)}>
        <div className="flex items-start gap-4 mb-4">
          <div className={cn("p-3 rounded-full shrink-0 border", style.bg, style.text, theme.border.default)}>
            {variant === 'info' ? <Info className="h-6 w-6"/> : <AlertTriangle className="h-6 w-6" />}
          </div>
          <p className={cn("text-sm leading-relaxed mt-1", theme.text.secondary)}>{message}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
})
