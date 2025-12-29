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

import React from 'react';
import toast, { Toaster, Toast as ToastType } from 'react-hot-toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

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
    low: 3000,
    normal: 4000,
    high: 6000,
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
      return <Info {...iconProps} className="text-blue-600" />;
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
      return 'border-blue-200 bg-blue-50';
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
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        {message && <div className="mt-1 text-sm text-gray-700">{message}</div>}

        {/* Action button */}
        {action && (
          <button
            onClick={handleAction}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
            type="button"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
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
