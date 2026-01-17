/**
 * Toast Notification Component
 *
 * Production-ready toast notification system using react-hot-toast.
 * Provides real-time, auto-dismissing notifications with priority-based styling.
 *
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Priority levels (low, normal, high, urgent)
 * - Auto-dismiss with configurable duration
 * - Action buttons
 * - Icon support
 * - Smooth animations
 * - Accessibility compliant
 *
 * @module Toast
 */

import { TIMEOUTS } from '@/config/ports.config';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import React from 'react';
import toast, { Toaster, Toast as ToastType } from 'react-hot-toast';

/**
 * Toast notification props
 */
export interface ToastNotificationProps {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

/**
 * Toast configuration
 */
const TOAST_CONFIG = {
  duration: {
    low: TIMEOUTS.NOTIFICATION_SUCCESS,
    normal: TIMEOUTS.NOTIFICATION_DEFAULT,
    high: TIMEOUTS.NOTIFICATION_ERROR,
    urgent: 0, // Persistent
  },
  position: 'top-right' as const,
  maxToasts: 5,
};

/**
 * Get icon for toast type
 */
const getIcon = (type: ToastNotificationProps['type']): React.ReactNode => {
  const iconProps = { size: 20, strokeWidth: 2 };

  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="text-green-600" />;
    case 'error':
      return <AlertCircle {...iconProps} className="text-red-600" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-amber-600" />;
    case 'info':
      return <Info {...iconProps} className="text-blue-600 dark:text-blue-400" />;
  }
};

/**
 * Get color classes for toast type
 */
const getColorClasses = (type: ToastNotificationProps['type']): string => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50';
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-amber-200 bg-amber-50';
    case 'info':
      return 'border-blue-200 bg-white dark:border-blue-800 dark:bg-blue-950/20';
  }
};

/**
 * Custom toast component
 */
const CustomToast: React.FC<{
  t: ToastType;
  props: ToastNotificationProps;
}> = ({ t, props }) => {
  const { title, message, type, action, onDismiss } = props;

  const handleDismiss = (): void => {
    toast.dismiss(t.id);
    onDismiss?.();
  };

  const handleAction = (): void => {
    action?.onClick();
    toast.dismiss(t.id);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
        min-w-[320px] max-w-[480px]
        ${getColorClasses(type)}
        ${t.visible ? 'animate-enter' : 'animate-leave'}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getIcon(type)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{title}</div>
        {message && <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">{message}</div>}

        {/* Action button */}
        {action && (
          <button
            onClick={handleAction}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline dark:text-blue-400 dark:hover:text-blue-300"
            type="button"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 focus:outline-none transition-colors text-slate-500 hover:text-slate-700 focus:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Dismiss notification"
        type="button"
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  );
};

/**
 * Show toast notification
 */
export const showToast = (props: ToastNotificationProps): string => {
  const priority = props.priority || 'normal';
  const duration = props.duration ?? TOAST_CONFIG.duration[priority];

  return toast.custom(
    t => <CustomToast t={t} props={props} />,
    {
      duration,
      position: TOAST_CONFIG.position,
    },
  );
};

/**
 * Convenience functions
 */
export const toastSuccess = (
  title: string,
  message?: string,
  options?: Partial<ToastNotificationProps>,
): string => {
  return showToast({
    title,
    message,
    type: 'success',
    priority: 'normal',
    ...options,
  });
};

export const toastError = (
  title: string,
  message?: string,
  options?: Partial<ToastNotificationProps>,
): string => {
  return showToast({
    title,
    message,
    type: 'error',
    priority: 'urgent',
    ...options,
  });
};

export const toastWarning = (
  title: string,
  message?: string,
  options?: Partial<ToastNotificationProps>,
): string => {
  return showToast({
    title,
    message,
    type: 'warning',
    priority: 'high',
    ...options,
  });
};

export const toastInfo = (
  title: string,
  message?: string,
  options?: Partial<ToastNotificationProps>,
): string => {
  return showToast({
    title,
    message,
    type: 'info',
    priority: 'normal',
    ...options,
  });
};

/**
 * Dismiss specific toast
 */
export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = (): void => {
  toast.dismiss();
};

/**
 * Toast Container Component
 * Place this at the root of your app
 */
export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position={TOAST_CONFIG.position}
      toastOptions={{
        duration: TOAST_CONFIG.duration.normal,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      gutter={12}
    />
  );
};

/**
 * Custom animations (add to global CSS)
 */
export const toastAnimations = `
@keyframes enter {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes leave {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-enter {
  animation: enter 0.3s ease-out;
}

.animate-leave {
  animation: leave 0.2s ease-in;
}
`;

export default {
  showToast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  dismissToast,
  dismissAllToasts,
  ToastContainer,
};
