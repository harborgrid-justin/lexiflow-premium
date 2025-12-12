/**
 * Toast Component
 * Standalone toast notification component (exported for use outside ToastContext)
 */

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  variant = 'info',
  title,
  message,
  onClose,
  duration,
  action,
  className,
}) => {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const borderColors = {
    success: 'border-green-500 dark:border-green-400',
    error: 'border-red-500 dark:border-red-400',
    warning: 'border-amber-500 dark:border-amber-400',
    info: 'border-blue-500 dark:border-blue-400',
  };

  const iconColors = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400',
  };

  const Icon = icons[variant];

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start w-80 p-4 rounded-lg shadow-lg border',
        'bg-white dark:bg-slate-800',
        borderColors[variant],
        'animate-in slide-in-from-right-full duration-300',
        className
      )}
    >
      <div className="shrink-0 mr-3">
        <Icon className={cn('h-5 w-5', iconColors[variant])} />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4
            className={cn(
              'text-sm font-semibold mb-1',
              theme.text.primary
            )}
          >
            {title}
          </h4>
        )}
        <p
          className={cn(
            'text-sm',
            title ? theme.text.secondary : cn('font-medium', theme.text.primary)
          )}
        >
          {message}
        </p>

        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-2 text-sm font-medium underline',
              iconColors[variant],
              'hover:opacity-80 transition-opacity'
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'ml-3 text-slate-400 hover:text-slate-600',
            'dark:hover:text-slate-200 transition-colors'
          )}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Toast container for manual toast management
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'bottom-right',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-[6000] flex flex-col gap-2 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
          className="pointer-events-auto"
        />
      ))}
    </div>
  );
};

export default Toast;
