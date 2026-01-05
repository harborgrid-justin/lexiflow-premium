/**
 * @module components/enterprise/notifications/ToastContainer
 * @category Enterprise - Notifications
 * @description Enterprise toast notification system with sound, animations, and priority handling
 */

import type { UINotification } from '@/types/notifications';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface ToastNotification extends Omit<UINotification, 'timestamp'> {
  timestamp: number;
}

export interface ToastContainerProps {
  /** Maximum number of visible toasts */
  maxVisible?: number;
  /** Position of toast container */
  position?:
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
  /** Enable sound notifications */
  enableSound?: boolean;
  /** Enable visual effects */
  enableVisualEffects?: boolean;
  /** Custom className */
  className?: string;
  /** Gap between toasts */
  gap?: number;
}

export interface ToastContextValue {
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  toggleSound: () => void;
  isSoundEnabled: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================
export const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToastNotifications = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastNotifications must be used within ToastContainer');
  }
  return context;
};

// ============================================================================
// COMPONENT
// ============================================================================
export const ToastContainer: React.FC<React.PropsWithChildren<ToastContainerProps>> = ({
  children,
  maxVisible = 5,
  position = 'bottom-right',
  enableSound: initialEnableSound = true,
  enableVisualEffects = true,
  className,
  gap = 8,
}) => {
  // HYDRATION-SAFE: Track mounted state for browser-only APIs
  const [isMounted, setIsMounted] = React.useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(initialEnableSound);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // HYDRATION-SAFE: Play notification sound only in browser environment after mount
  const playSound = useCallback(
    (type: ToastNotification['type']) => {
      if (!isSoundEnabled || !isMounted || typeof window === 'undefined') return;

      // Create audio context for different notification types
      // AudioContext is browser-only, checked above
      const audioContext = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 700,
      };

      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';

      // Volume and duration
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    },
    [isSoundEnabled, isMounted]
  );

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Add toast
  const addToast = useCallback(
    (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
      // DETERMINISTIC RENDERING: Use crypto.randomUUID when available
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const timestamp = Date.now();

      const newToast: ToastNotification = {
        ...toast,
        id,
        timestamp,
        duration: toast.duration ?? (toast.type === 'error' ? 7000 : 5000),
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev].slice(0, maxVisible);
        return updated;
      });

      // Play sound
      playSound(newToast.type);

      // Auto dismiss
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [maxVisible, playSound, removeToast]
  );

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  // Get icon for toast type
  const getIcon = (type: ToastNotification['type']) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-emerald-500')} />;
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-rose-500')} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-amber-500')} />;
      default:
        return <Info className={cn(iconClass, 'text-blue-500')} />;
    }
  };

  // Get toast color scheme
  const getColorScheme = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'error':
        return 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'warning':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
  };

  // Animation variants

  const getToastVariants = () => {
    if (position.includes('right')) {
      return {
        initial: { opacity: 0, x: 100, scale: 0.8 },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 30,
          },
        },
        exit: { opacity: 0, x: 100, scale: 0.8 },
      };
    } else if (position.includes('left')) {
      return {
        initial: { opacity: 0, x: -100, scale: 0.8 },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 30,
          },
        },
        exit: { opacity: 0, x: -100, scale: 0.8 },
      };
    } else {
      return {
        initial: { opacity: 0, y: position.includes('top') ? -100 : 100, scale: 0.8 },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 30,
          },
        },
        exit: { opacity: 0, y: position.includes('top') ? -100 : 100, scale: 0.8 },
      };
    }
  };

  const toastVariants = getToastVariants();

  const contextValue: ToastContextValue = {
    addToast,
    removeToast,
    clearAllToasts,
    toggleSound,
    isSoundEnabled,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div
        className={cn(
          'fixed z-[9999] flex flex-col pointer-events-none',
          positionClasses[position],
          className
        )}
        style={{ gap: `${gap}px` }}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                'pointer-events-auto flex items-start gap-3 w-96 max-w-full p-4 rounded-xl border-2 shadow-2xl backdrop-blur-sm',
                getColorScheme(toast.type),
                toast.priority === 'urgent' && 'ring-2 ring-red-500 ring-offset-2',
                'bg-white/95 dark:bg-slate-800/95'
              )}
              role="alert"
              aria-live={toast.priority === 'urgent' ? 'assertive' : 'polite'}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {toast.title}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {toast.message}
                </p>

                {/* Actions */}
                {toast.actions && toast.actions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {toast.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          action.onClick();
                          removeToast(toast.id);
                        }}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                          action.variant === 'primary' &&
                          'bg-blue-600 text-white hover:bg-blue-700',
                          action.variant === 'danger' &&
                          'bg-red-600 text-white hover:bg-red-700',
                          (!action.variant || action.variant === 'secondary') &&
                          'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Progress bar for auto-dismiss */}
              {toast.duration && toast.duration > 0 && enableVisualEffects && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sound Toggle Button */}
      {toasts.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleSound}
          className={cn(
            'fixed z-[10000] p-2 rounded-full shadow-lg transition-colors pointer-events-auto',
            'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
            position.includes('right') ? 'right-4' : 'left-4',
            position.includes('top') ? 'top-20' : 'bottom-20'
          )}
          aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
          title={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {isSoundEnabled ? (
            <Volume2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          ) : (
            <VolumeX className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          )}
        </motion.button>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContainer;
