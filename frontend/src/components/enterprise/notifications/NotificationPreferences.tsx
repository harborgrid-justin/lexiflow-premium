/**
 * @module components/enterprise/notifications/NotificationPreferences
 * @category Enterprise - Notifications
 * @description User preferences panel for notification settings
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Clock,
  Save,
  RotateCcw,
  Slack,
  Calendar,
  Briefcase,
  FileText,
  CreditCard,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { NotificationPreferences as NotificationPreferencesType } from '@/types/notifications';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface ExtendedNotificationPreferences extends NotificationPreferencesType {
  sound: boolean;
  desktop: boolean;
  categories: {
    cases: boolean;
    documents: boolean;
    deadlines: boolean;
    billing: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationPreferencesProps {
  /** Current preferences */
  preferences: ExtendedNotificationPreferences;
  /** Save handler */
  onSave: (preferences: ExtendedNotificationPreferences) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences: initialPreferences,
  onSave,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [preferences, setPreferences] = useState<ExtendedNotificationPreferences>(
    initialPreferences
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Update preference
  const updatePreference = <K extends keyof ExtendedNotificationPreferences>(
    key: K,
    value: ExtendedNotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Update nested preference
  const updateNestedPreference = <
    K extends keyof ExtendedNotificationPreferences,
    NK extends keyof ExtendedNotificationPreferences[K]
  >(
    key: K,
    nestedKey: NK,
    value: ExtendedNotificationPreferences[K][NK]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as object),
        [nestedKey]: value,
      },
    }));
    setHasChanges(true);
  };

  // Reset to initial
  const handleReset = () => {
    setPreferences(initialPreferences);
    setHasChanges(false);
  };

  // Handle save
  const handleSave = () => {
    onSave(preferences);
    setHasChanges(false);
  };

  // Toggle component
  const Toggle: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  // Setting row component
  const SettingRow: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ icon: Icon, title, description, enabled, onChange, disabled }) => (
    <div className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
            {title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <div className={cn('flex flex-col h-full bg-slate-50 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Bell className="h-7 w-7" />
              Notification Preferences
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Customize how you receive notifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RotateCcw className="h-4 w-4 inline mr-2" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                hasChanges && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-400 cursor-not-allowed'
              )}
            >
              <Save className="h-4 w-4 inline mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Notification Channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Choose how you want to receive notifications
              </p>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <SettingRow
                icon={Mail}
                title="Email Notifications"
                description="Receive notifications via email"
                enabled={preferences.email}
                onChange={(value) => updatePreference('email', value)}
              />
              <SettingRow
                icon={Smartphone}
                title="Push Notifications"
                description="Receive push notifications on your devices"
                enabled={preferences.push}
                onChange={(value) => updatePreference('push', value)}
              />
              <SettingRow
                icon={Slack}
                title="Slack Notifications"
                description="Receive notifications in Slack"
                enabled={preferences.slack}
                onChange={(value) => updatePreference('slack', value)}
              />
              <SettingRow
                icon={Bell}
                title="Desktop Notifications"
                description="Show desktop notifications in your browser"
                enabled={preferences.desktop}
                onChange={(value) => updatePreference('desktop', value)}
              />
              <SettingRow
                icon={preferences.sound ? Volume2 : VolumeX}
                title="Sound Alerts"
                description="Play sound when receiving notifications"
                enabled={preferences.sound}
                onChange={(value) => updatePreference('sound', value)}
              />
            </div>
          </motion.div>

          {/* Notification Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Notification Categories
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Choose which types of notifications you want to receive
              </p>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <SettingRow
                icon={Briefcase}
                title="Case Notifications"
                description="Updates about your cases and assignments"
                enabled={preferences.categories.cases}
                onChange={(value) => updateNestedPreference('categories', 'cases', value)}
              />
              <SettingRow
                icon={FileText}
                title="Document Notifications"
                description="Document uploads, changes, and reviews"
                enabled={preferences.categories.documents}
                onChange={(value) =>
                  updateNestedPreference('categories', 'documents', value)
                }
              />
              <SettingRow
                icon={Calendar}
                title="Deadline Reminders"
                description="Upcoming deadlines and calendar events"
                enabled={preferences.categories.deadlines}
                onChange={(value) =>
                  updateNestedPreference('categories', 'deadlines', value)
                }
              />
              <SettingRow
                icon={CreditCard}
                title="Billing Alerts"
                description="Payment reminders and billing updates"
                enabled={preferences.categories.billing}
                onChange={(value) => updateNestedPreference('categories', 'billing', value)}
              />
              <SettingRow
                icon={AlertTriangle}
                title="System Alerts"
                description="System maintenance and security updates"
                enabled={preferences.categories.system}
                onChange={(value) => updateNestedPreference('categories', 'system', value)}
              />
            </div>
          </motion.div>

          {/* Digest Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Email Digest Frequency
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                How often should we send you email summaries?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['Realtime', 'Daily', 'Weekly'] as const).map((frequency) => (
                <button
                  key={frequency}
                  onClick={() => updatePreference('digestFrequency', frequency)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-center',
                    preferences.digestFrequency === frequency
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div className="font-semibold">{frequency}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {frequency === 'Realtime' && 'Instant notifications'}
                    {frequency === 'Daily' && 'Once per day'}
                    {frequency === 'Weekly' && 'Once per week'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quiet Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Pause non-urgent notifications during specific hours
                </p>
              </div>
              <Toggle
                enabled={preferences.quietHours.enabled}
                onChange={(value) => updateNestedPreference('quietHours', 'enabled', value)}
              />
            </div>

            {preferences.quietHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      updateNestedPreference('quietHours', 'start', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      updateNestedPreference('quietHours', 'end', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer - Sticky Save Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-lg"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You have unsaved changes
          </p>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationPreferences;
