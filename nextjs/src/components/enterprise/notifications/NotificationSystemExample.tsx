/**
 * @module components/enterprise/notifications/NotificationSystemExample
 * @category Enterprise - Notifications
 * @description Complete example of the enterprise notification system integration
 *
 * This file demonstrates how to integrate all notification components:
 * - NotificationBell in the header
 * - NotificationPanel dropdown
 * - ToastContainer for toast notifications
 * - NotificationCenter full page
 * - NotificationPreferences settings
 * - ConnectionStatus indicator
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NotificationBell,
  NotificationPanel,
  ToastContainer,
  useToastNotifications,
  NotificationCenter,
  NotificationPreferences,
  ConnectionStatus,
  type UINotification,
  type ExtendedNotificationPreferences,
  type ConnectionState,
} from './index';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockNotifications: UINotification[] = [
  {
    id: '1',
    title: 'New Case Assignment',
    message: 'You have been assigned to Case #12345 - Smith vs. Johnson',
    type: 'info',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    priority: 'high',
  },
  {
    id: '2',
    title: 'Document Uploaded',
    message: 'New evidence document uploaded to Case #12345',
    type: 'success',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    priority: 'normal',
  },
  {
    id: '3',
    title: 'Deadline Approaching',
    message: 'Motion filing deadline in 2 days for Case #67890',
    type: 'warning',
    read: true,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    priority: 'urgent',
  },
  {
    id: '4',
    title: 'Payment Failed',
    message: 'Monthly subscription payment failed. Please update your payment method.',
    type: 'error',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    priority: 'urgent',
  },
];

const mockPreferences: ExtendedNotificationPreferences = {
  email: true,
  push: true,
  slack: false,
  digestFrequency: 'Daily',
  sound: true,
  desktop: true,
  categories: {
    cases: true,
    documents: true,
    deadlines: true,
    billing: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

/**
 * Example 1: Header with Notification Bell
 */
export const HeaderWithNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<UINotification[]>(mockNotifications);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    setIsPanelOpen(false);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          LexiFlow Premium
        </h1>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            isOpen={isPanelOpen}
            animated
            size="md"
            variant="default"
          />

          {/* Notification Panel */}
          <NotificationPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onViewAll={() => console.log('Navigate to notification center')}
          />
        </div>
      </div>
    </header>
  );
};

/**
 * Example 2: Full Notification Center Page
 */
export const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<UINotification[]>(mockNotifications);
  const navigate = useNavigate();

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAsReadBulk = useCallback((ids: string[]) => {
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleDeleteBulk = useCallback((ids: string[]) => {
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationCenter
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAsReadBulk={handleMarkAsReadBulk}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onDeleteBulk={handleDeleteBulk}
      onClearAll={handleClearAll}
      onOpenPreferences={() => navigate('/notifications/preferences')}
    />
  );
};

/**
 * Example 3: Notification Preferences Page
 */
export const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<ExtendedNotificationPreferences>(
    mockPreferences
  );

  const handleSave = useCallback((newPreferences: ExtendedNotificationPreferences) => {
    setPreferences(newPreferences);
    console.log('Saving preferences:', newPreferences);
    // TODO: Save to backend API
  }, []);

  return (
    <NotificationPreferences
      preferences={preferences}
      onSave={handleSave}
      onCancel={() => console.log('Cancelled')}
    />
  );
};

/**
 * Example 4: Toast Notifications Usage
 */
export const ToastExample: React.FC = () => {
  const { addToast } = useToastNotifications();

  const showSuccessToast = () => {
    addToast({
      title: 'Success',
      message: 'Your changes have been saved successfully.',
      type: 'success',
      priority: 'normal',
      read: false,
    });
  };

  const showErrorToast = () => {
    addToast({
      title: 'Error',
      message: 'Failed to save changes. Please try again.',
      type: 'error',
      priority: 'urgent',
      read: false,
      actions: [
        {
          label: 'Retry',
          onClick: () => console.log('Retrying...'),
          variant: 'primary',
        },
      ],
    });
  };

  const showInfoToast = () => {
    addToast({
      title: 'Information',
      message: 'System maintenance scheduled for tonight at 2 AM.',
      type: 'info',
      priority: 'normal',
      read: false,
    });
  };

  const showWarningToast = () => {
    addToast({
      title: 'Warning',
      message: 'Your session will expire in 5 minutes.',
      type: 'warning',
      priority: 'high',
      read: false,
      actions: [
        {
          label: 'Extend Session',
          onClick: () => console.log('Extending session...'),
          variant: 'primary',
        },
      ],
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Notification Examples</h2>
      <div className="flex gap-4">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Show Error Toast
        </button>
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show Info Toast
        </button>
        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Show Warning Toast
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: WebSocket Connection Status
 */
export const ConnectionStatusExample: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [lastConnected, setLastConnected] = useState<Date>(new Date());
  const [latency, setLatency] = useState<number>(45);

  // Simulate connection state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const states: ConnectionState[] = [
        'connected',
        'connecting',
        'reconnecting',
        'disconnected',
        'error',
      ];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setConnectionState(randomState);

      if (randomState === 'connected') {
        setLastConnected(new Date());
        setLatency(Math.floor(Math.random() * 200) + 20);
      }
    }, 10000); // Change state every 10 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = () => {
    setConnectionState('connecting');
    setTimeout(() => {
      setConnectionState('connected');
      setLastConnected(new Date());
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Connection Status Examples</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Badge Variant (Bottom Right)</h3>
        <ConnectionStatus
          state={connectionState}
          onReconnect={handleReconnect}
          lastConnected={lastConnected}
          variant="badge"
          position="bottom-right"
          animated
          latency={latency}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Full Variant</h3>
        <ConnectionStatus
          state={connectionState}
          onReconnect={handleReconnect}
          lastConnected={lastConnected}
          variant="full"
          animated
          latency={latency}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Minimal Variant</h3>
        <ConnectionStatus
          state={connectionState}
          variant="minimal"
          animated
          latency={latency}
        />
      </div>
    </div>
  );
};

/**
 * Example 6: Complete App Integration
 */
export const CompleteNotificationSystemExample: React.FC = () => {
  return (
    <ToastContainer position="bottom-right" enableSound enableVisualEffects>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header with Notification Bell */}
        <HeaderWithNotifications />

        {/* Connection Status Indicator */}
        <ConnectionStatus
          state="connected"
          variant="badge"
          position="bottom-left"
          animated
          autoHide
        />

        {/* Main Content - Can switch between different views */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <ToastExample />
            <ConnectionStatusExample />
          </div>
        </main>
      </div>
    </ToastContainer>
  );
};

export default CompleteNotificationSystemExample;
