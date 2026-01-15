/**
 * @module enterprise/ui/NotificationSystem
 * @category Enterprise UI
 * @description Comprehensive notification system with toasts, notification center, and push handling
 *
 * Features:
 * - Toast notifications with auto-dismiss
 * - Notification center with history
 * - Push notification handling
 * - Multiple notification types (success, error, warning, info)
 * - Action buttons in notifications
 * - Sound and visual alerts
 * - Mark as read/unread
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ExternalLink,
  Info,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { cn } from '@/lib/cn';
import { } from '@/components/atoms//';
import { useTheme } from "@/hooks/useTheme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
  actions?: NotificationAction[];
  timestamp: Date;
  read?: boolean;
  persistent?: boolean; // Keep in notification center even after dismissal
  sound?: boolean;
}

export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const ToastNotification: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const { isDark } = useTheme();

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: isDark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-100' : cn(theme.status.success.background, 'border-emerald-200'),
    error: isDark ? 'bg-rose-900/20 border-rose-800 text-rose-100' : cn(theme.status.error.background, 'border-rose-200', theme.status.error.text),
    warning: isDark ? 'bg-amber-900/20 border-amber-800 text-amber-100' : cn(theme.status.warning.background, 'border-amber-200', theme.status.warning.text),
    info: isDark ? 'bg-blue-900/20 border-blue-800 text-blue-100' : cn(theme.colors.info, 'border-blue-200 dark:border-blue-800')
  };

  const iconColors = {
    success: cn(theme.status.success.text),
    error: cn(theme.status.error.text),
    warning: cn(theme.status.warning.text),
    info: cn(theme.colors.info)
  };

  const Icon = icons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 100 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-md',
        colors[notification.type]
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[notification.type])} />

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
        {notification.message && (
          <p className="text-sm opacity-90">{notification.message}</p>
        )}

        {notification.actions && notification.actions.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {notification.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  onDismiss(notification.id);
                }}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  action.variant === 'primary'
                    ? 'bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800'
                    : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(notification.id)}
        style={{ backgroundColor: 'transparent' }}
        style={{ backgroundColor: 'transparent' }}
        className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// ============================================================================
// NOTIFICATION CENTER COMPONENT
// ============================================================================

export const NotificationCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearAll, removeNotification, unreadCount } =
    useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  );

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn('fixed inset-0 z-40 backdrop-blur-sm', theme.backdrop)}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col border-l shadow-2xl',
          theme.surface.default,
          theme.border.default
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between px-6 py-4 border-b', theme.border.default)}>
          <div>
            <h3 className={cn('text-lg font-bold', theme.text.primary)}>Notifications</h3>
            {unreadCount > 0 && (
              <p className={cn('text-xs', theme.text.tertiary)}>
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn('p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800', theme.text.tertiary)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className={cn('flex items-center gap-2 px-6 py-3 border-b', theme.border.default)}>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 ' + theme.text.secondary
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 ' + theme.text.secondary
            )}
          >
            Unread ({unreadCount})
          </button>

          <div className="flex-1" />

          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                  theme.text.secondary
                )}
              >
                Mark all read
              </button>
              <button
                onClick={clearAll}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors'
                )}
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className={cn('flex flex-col items-center justify-center py-12 px-6', theme.text.tertiary)}>
              <BellOff className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {filteredNotifications.map((notification) => {
                const Icon = icons[notification.type];
                const isUnread = !notification.read;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 transition-colors relative',
                      isUnread && 'bg-blue-50/50 dark:bg-blue-900/10',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    {isUnread && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600" />
                    )}

                    <div className="flex items-start gap-3 ml-4">
                      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', theme.text.secondary)} />

                      <div className="flex-1 min-w-0">
                        <h4 className={cn('font-semibold text-sm mb-1', theme.text.primary)}>
                          {notification.title}
                        </h4>
                        {notification.message && (
                          <p className={cn('text-sm mb-2', theme.text.secondary)}>
                            {notification.message}
                          </p>
                        )}
                        <p className={cn('text-xs', theme.text.tertiary)}>
                          {notification.timestamp.toLocaleTimeString()} - {notification.timestamp.toLocaleDateString()}
                        </p>

                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {notification.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={action.onClick}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                              >
                                {action.label}
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className={cn('p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700', theme.text.tertiary)}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className={cn('p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700', theme.text.tertiary)}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  );
};

// ============================================================================
// NOTIFICATION PROVIDER
// ============================================================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
      const id = `notif-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Add to toasts if not persistent-only
      if (notification.duration !== 0) {
        setToasts((prev) => [...prev, newNotification]);
      }

      // Play sound if enabled
      if (notification.sound && 'AudioContext' in window) {
        // Simple beep sound (could be replaced with actual audio file)
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = notification.type === 'error' ? 200 : 800;
        gainNode.gain.value = 0.1;

        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
      }

      // Auto-dismiss toast
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((n) => n.id !== id));
        }, notification.duration);
      }

      return id;
    },
    []
  );

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const contextValue: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      {mounted && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {toasts.map((notification) => (
                <div key={notification.id} className="pointer-events-auto">
                  <ToastNotification
                    notification={notification}
                    onDismiss={removeNotification}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// NOTIFICATION BELL COMPONENT
// ============================================================================

export const NotificationBell: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'relative p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
          theme.text.secondary,
          className
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-rose-500 rounded-full"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

export const useToast = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, duration: 5000, ...options }),
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, duration: 7000, ...options }),
    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, duration: 6000, ...options }),
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, duration: 5000, ...options })
  };
};

export default NotificationProvider;
