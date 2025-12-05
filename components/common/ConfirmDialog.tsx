
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

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

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger'
}) => {
  const { theme } = useTheme();

  const variantStyles = {
      danger: { bg: theme.status.error.bg, text: theme.status.error.text },
      warning: { bg: theme.status.warning.bg, text: theme.status.warning.text },
      info: { bg: theme.status.info.bg, text: theme.status.info.text }
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={cn("p-6", theme.surface)}>
        <div className="flex items-start gap-4 mb-4">
          <div className={cn("p-3 rounded-full shrink-0 border", style.bg, style.text, theme.border.light)}>
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
};
