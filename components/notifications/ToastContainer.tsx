/**
 * ToastContainer Component
 * Toast notification system for displaying temporary notifications
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { Notification } from '../../hooks/useNotificationStream';

interface Toast extends Notification {
  visible: boolean;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
  defaultDuration?: number;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 3,
  defaultDuration = 5000,
  className = '',
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast
  const addToast = useCallback((notification: Notification) => {
    setToasts(prev => {
      const newToast: Toast = {
        ...notification,
        visible: true,
      };

      const next = [newToast, ...prev];
      if (next.length > maxToasts) {
        return next.slice(0, maxToasts);
      }
      return next;
    });

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(notification.id);
    }, defaultDuration);
  }, [maxToasts, defaultDuration]);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    // Actually remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  // Listen for toast events
  useEffect(() => {
    const handleToast = (event: CustomEvent<Notification>) => {
      addToast(event.detail);
    };

    window.addEventListener('notification:toast' as any, handleToast);
    return () => {
      window.removeEventListener('notification:toast' as any, handleToast);
    };
  }, [addToast]);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 pointer-events-none ${getPositionClasses()} ${className}`}
      style={{ maxWidth: '400px' }}
    >
      <div className="flex flex-col gap-2">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { title, message, priority, visible, actionUrl } = toast;

  // Priority colors and styles
  const getPriorityStyles = () => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-600 text-white';
      case 'low':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  // Handle click
  const handleClick = () => {
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    onClose();
  };

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-300 ${
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`rounded-lg shadow-lg overflow-hidden ${getPriorityStyles()} ${
          actionUrl ? 'cursor-pointer' : ''
        }`}
        onClick={actionUrl ? handleClick : undefined}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {priority === 'urgent' || priority === 'high' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm opacity-90">{message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action link */}
          {actionUrl && (
            <div className="mt-3">
              <span className="text-sm font-medium underline">
                View details →
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/40 animate-progress"
            style={{
              animation: 'progress 5s linear forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;
document.head.appendChild(style);

export default ToastContainer;
