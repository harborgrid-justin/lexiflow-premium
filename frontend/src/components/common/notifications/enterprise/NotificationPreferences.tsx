/**
 * @module components/enterprise/notifications/NotificationPreferences
 * @category Enterprise - Notifications
 * @description User preferences panel for notification settings
 */

import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import type { NotificationPreferences as NotificationPreferencesType } from '@/types/notifications';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Info,
  Mail,
  RotateCcw,
  Save,
  Slack,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';

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
  const { theme, tokens } = useTheme();
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
      style={{
        backgroundColor: enabled ? theme.primary.DEFAULT : theme.surface.muted,
        borderRadius: tokens.borderRadius.full,
        ...(disabled && { opacity: 0.5, cursor: 'not-allowed' })
      }}
      className={cn(
        'relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none focus:ring-2',
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        style={{
          backgroundColor: theme.surface.base,
          borderRadius: tokens.borderRadius.full,
        }}
        className={cn(
          'inline-block h-4 w-4 transform transition-transform',
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
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing.normal.md,
    }}
      className="flex items-start justify-between gap-4 transition-colors hover:bg-opacity-50"
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div className="flex items-start gap-3 flex-1">
        <div style={{
          padding: tokens.spacing.normal.sm,
          borderRadius: tokens.borderRadius.lg,
          backgroundColor: theme.surface.muted,
        }}>
          <Icon style={{ color: theme.text.secondary }} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 style={{ color: theme.text.primary, fontWeight: tokens.typography.fontWeight.medium }} className="mb-1">
            {title}
          </h4>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <div style={{ backgroundColor: theme.surface.elevated }} className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div style={{ backgroundColor: theme.surface.base, borderBottom: `1px solid ${theme.border.default}`, padding: tokens.spacing.normal.lg }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: theme.text.primary }} className="flex items-center gap-3">
              <Bell className="h-7 w-7" />
              Notification Preferences
            </h1>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary, marginTop: tokens.spacing.normal.xs }}>
              Customize how you receive notifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                style={{
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                  backgroundColor: theme.surface.muted,
                  borderRadius: tokens.borderRadius.lg,
                }}
                className="transition-colors focus:outline-none focus:ring-2"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.muted}
              >
                <RotateCcw className="h-4 w-4 inline mr-2" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              style={{
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.surface.base,
                backgroundColor: hasChanges && !isLoading ? theme.primary.DEFAULT : theme.surface.muted,
                borderRadius: tokens.borderRadius.lg,
                cursor: hasChanges && !isLoading ? 'pointer' : 'not-allowed',
              }}
              className="transition-colors focus:outline-none focus:ring-2"
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
            style={{
              backgroundColor: theme.surface.base,
              borderRadius: tokens.borderRadius.xl,
              border: `1px solid ${theme.border.default}`,
            }}
            className="overflow-hidden"
          >
            <div style={{
              padding: tokens.spacing.normal.lg,
              borderBottom: `1px solid ${theme.border.default}`,
            }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: theme.text.primary,
              }} className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </h2>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.secondary,
                marginTop: tokens.spacing.normal.xs,
              }}>
                Choose how you want to receive notifications
              </p>
            </div>
            <div style={{ borderTop: `1px solid ${theme.border.light}` }} className="divide-y">
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
            style={{
              backgroundColor: theme.surface.base,
              borderRadius: tokens.borderRadius.xl,
              border: `1px solid ${theme.border.default}`,
            }}
            className="overflow-hidden"
          >
            <div style={{
              padding: tokens.spacing.normal.lg,
              borderBottom: `1px solid ${theme.border.default}`,
            }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: theme.text.primary,
              }} className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Notification Categories
              </h2>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.secondary,
                marginTop: tokens.spacing.normal.xs,
              }}>
                Choose which types of notifications you want to receive
              </p>
            </div>
            <div style={{ borderTop: `1px solid ${theme.border.light}` }} className="divide-y">
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
            style={{
              backgroundColor: theme.surface.base,
              borderRadius: tokens.borderRadius.xl,
              border: `1px solid ${theme.border.default}`,
              padding: tokens.spacing.normal.lg,
            }}
          >
            <div style={{ marginBottom: tokens.spacing.normal.md }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: theme.text.primary,
              }} className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Email Digest Frequency
              </h2>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.secondary,
                marginTop: tokens.spacing.normal.xs,
              }}>
                How often should we send you email summaries?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['Realtime', 'Daily', 'Weekly'] as const).map((frequency) => (
                <button
                  key={frequency}
                  onClick={() => updatePreference('digestFrequency', frequency)}
                  style={{
                    padding: tokens.spacing.normal.md,
                    borderRadius: tokens.borderRadius.lg,
                    border: `2px solid ${preferences.digestFrequency === frequency ? theme.primary.DEFAULT : theme.border.default}`,
                    backgroundColor: preferences.digestFrequency === frequency ? `${theme.primary.DEFAULT}15` : 'transparent',
                    color: preferences.digestFrequency === frequency ? theme.primary.DEFAULT : theme.text.primary,
                    textAlign: 'center',
                  }}
                  className="transition-all"
                >
                  <div style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{frequency}</div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, marginTop: tokens.spacing.normal.xs, opacity: 0.75 }}>
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
            style={{
              backgroundColor: theme.surface.base,
              borderRadius: tokens.borderRadius.xl,
              border: `1px solid ${theme.border.default}`,
              padding: tokens.spacing.normal.lg,
            }}
          >
            <div style={{ marginBottom: tokens.spacing.normal.md }} className="flex items-start justify-between gap-4">
              <div>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: theme.text.primary,
                }} className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </h2>
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.secondary,
                  marginTop: tokens.spacing.normal.xs,
                }}>
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
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.primary,
                    marginBottom: tokens.spacing.normal.sm,
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      updateNestedPreference('quietHours', 'start', e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                      backgroundColor: theme.surface.input,
                      border: 0,
                      borderRadius: tokens.borderRadius.lg,
                      color: theme.text.primary,
                    }}
                    className="focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.primary,
                    marginBottom: tokens.spacing.normal.sm,
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      updateNestedPreference('quietHours', 'end', e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                      backgroundColor: theme.surface.input,
                      border: 0,
                      borderRadius: tokens.borderRadius.lg,
                      color: theme.text.primary,
                    }}
                    className="focus:outline-none focus:ring-2"
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
          style={{
            backgroundColor: theme.surface.base,
            borderTop: `1px solid ${theme.border.default}`,
            padding: tokens.spacing.normal.md,
          }}
          className="flex items-center justify-between shadow-lg"
        >
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            You have unsaved changes
          </p>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                  backgroundColor: 'transparent',
                  borderRadius: tokens.borderRadius.lg,
                }}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleReset}
              style={{
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.primary,
                backgroundColor: theme.surface.muted,
                borderRadius: tokens.borderRadius.lg,
              }}
              className="transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.muted}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.surface.base,
                backgroundColor: theme.primary.DEFAULT,
                borderRadius: tokens.borderRadius.lg,
              }}
              className="transition-colors"
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
