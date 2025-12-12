import { Injectable, Logger } from '@nestjs/common';

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
  SLACK = 'slack',
}

export enum NotificationCategory {
  CASE_UPDATES = 'case_updates',
  DOCUMENT_ACTIVITY = 'document_activity',
  MENTIONS = 'mentions',
  DEADLINES = 'deadlines',
  TASKS = 'tasks',
  MESSAGES = 'messages',
  COLLABORATION = 'collaboration',
  SYSTEM = 'system',
  BILLING = 'billing',
  SECURITY = 'security',
}

export interface ChannelPreference {
  enabled: boolean;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
  quietHours?: {
    start: string; // HH:MM format
    end: string;
    timezone: string;
  };
}

export interface CategoryPreferences {
  [NotificationCategory.CASE_UPDATES]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.DOCUMENT_ACTIVITY]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.MENTIONS]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.DEADLINES]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.TASKS]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.MESSAGES]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.COLLABORATION]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.SYSTEM]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.BILLING]: Record<NotificationChannel, ChannelPreference>;
  [NotificationCategory.SECURITY]: Record<NotificationChannel, ChannelPreference>;
}

export interface UserNotificationPreferences {
  userId: string;
  categories: Partial<CategoryPreferences>;
  doNotDisturb: boolean;
  dndSchedule?: {
    start: string;
    end: string;
    timezone: string;
    days?: number[]; // 0-6, Sunday-Saturday
  };
  updatedAt: Date;
}

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);
  private preferences = new Map<string, UserNotificationPreferences>();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // Default preferences that will be used for new users
    this.logger.log('Notification preferences service initialized');
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): UserNotificationPreferences {
    let prefs = this.preferences.get(userId);

    if (!prefs) {
      prefs = this.createDefaultPreferences(userId);
      this.preferences.set(userId, prefs);
    }

    return prefs;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>,
  ): UserNotificationPreferences {
    const current = this.getUserPreferences(userId);

    const updated: UserNotificationPreferences = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date(),
    };

    this.preferences.set(userId, updated);

    this.logger.log(`Updated notification preferences for user ${userId}`);

    return updated;
  }

  /**
   * Update category preferences
   */
  updateCategoryPreferences(
    userId: string,
    category: NotificationCategory,
    channelPrefs: Partial<Record<NotificationChannel, ChannelPreference>>,
  ): void {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.categories[category]) {
      prefs.categories[category] = {} as any;
    }

    Object.entries(channelPrefs).forEach(([channel, pref]) => {
      prefs.categories[category]![channel as NotificationChannel] = pref;
    });

    prefs.updatedAt = new Date();

    this.logger.log(
      `Updated ${category} preferences for user ${userId}`,
    );
  }

  /**
   * Check if user should receive notification
   */
  shouldNotify(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel,
  ): boolean {
    const prefs = this.getUserPreferences(userId);

    // Check DND mode
    if (prefs.doNotDisturb) {
      // Allow critical notifications
      if (
        category === NotificationCategory.SECURITY ||
        category === NotificationCategory.SYSTEM
      ) {
        return true;
      }

      // Check DND schedule
      if (prefs.dndSchedule && this.isInDndSchedule(prefs.dndSchedule)) {
        return false;
      }

      return false;
    }

    // Check category preferences
    const categoryPref = prefs.categories[category];

    if (!categoryPref) {
      return true; // Default to allowing if no preference set
    }

    const channelPref = categoryPref[channel];

    if (!channelPref) {
      return true; // Default to allowing if no preference set
    }

    // Check if channel is enabled
    if (!channelPref.enabled) {
      return false;
    }

    // Check quiet hours
    if (channelPref.quietHours && this.isInQuietHours(channelPref.quietHours)) {
      return false;
    }

    return true;
  }

  /**
   * Set Do Not Disturb mode
   */
  setDoNotDisturb(
    userId: string,
    enabled: boolean,
    schedule?: {
      start: string;
      end: string;
      timezone: string;
      days?: number[];
    },
  ): void {
    const prefs = this.getUserPreferences(userId);

    prefs.doNotDisturb = enabled;

    if (schedule) {
      prefs.dndSchedule = schedule;
    }

    prefs.updatedAt = new Date();

    this.logger.log(
      `DND mode ${enabled ? 'enabled' : 'disabled'} for user ${userId}`,
    );
  }

  /**
   * Enable/disable channel for category
   */
  setChannelEnabled(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel,
    enabled: boolean,
  ): void {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.categories[category]) {
      prefs.categories[category] = {} as any;
    }

    if (!prefs.categories[category]![channel]) {
      prefs.categories[category]![channel] = {
        enabled,
      };
    } else {
      prefs.categories[category]![channel].enabled = enabled;
    }

    prefs.updatedAt = new Date();
  }

  /**
   * Set notification frequency
   */
  setFrequency(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel,
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly',
  ): void {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.categories[category]) {
      prefs.categories[category] = {} as any;
    }

    if (!prefs.categories[category]![channel]) {
      prefs.categories[category]![channel] = {
        enabled: true,
        frequency,
      };
    } else {
      prefs.categories[category]![channel].frequency = frequency;
    }

    prefs.updatedAt = new Date();
  }

  /**
   * Set quiet hours
   */
  setQuietHours(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel,
    quietHours: {
      start: string;
      end: string;
      timezone: string;
    },
  ): void {
    const prefs = this.getUserPreferences(userId);

    if (!prefs.categories[category]) {
      prefs.categories[category] = {} as any;
    }

    if (!prefs.categories[category]![channel]) {
      prefs.categories[category]![channel] = {
        enabled: true,
        quietHours,
      };
    } else {
      prefs.categories[category]![channel].quietHours = quietHours;
    }

    prefs.updatedAt = new Date();
  }

  /**
   * Bulk enable/disable all channels for category
   */
  setAllChannelsForCategory(
    userId: string,
    category: NotificationCategory,
    enabled: boolean,
  ): void {
    const channels = Object.values(NotificationChannel);

    channels.forEach((channel) => {
      this.setChannelEnabled(userId, category, channel, enabled);
    });
  }

  /**
   * Get notification frequency for category and channel
   */
  getFrequency(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel,
  ): 'instant' | 'hourly' | 'daily' | 'weekly' {
    const prefs = this.getUserPreferences(userId);
    const categoryPref = prefs.categories[category];

    if (!categoryPref) {
      return 'instant';
    }

    const channelPref = categoryPref[channel];

    return channelPref?.frequency || 'instant';
  }

  /**
   * Reset preferences to defaults
   */
  resetToDefaults(userId: string): UserNotificationPreferences {
    const defaults = this.createDefaultPreferences(userId);
    this.preferences.set(userId, defaults);

    this.logger.log(`Reset preferences to defaults for user ${userId}`);

    return defaults;
  }

  /**
   * Export user preferences
   */
  exportPreferences(userId: string): string {
    const prefs = this.getUserPreferences(userId);
    return JSON.stringify(prefs, null, 2);
  }

  /**
   * Import user preferences
   */
  importPreferences(userId: string, data: string): boolean {
    try {
      const prefs = JSON.parse(data) as UserNotificationPreferences;
      prefs.userId = userId;
      prefs.updatedAt = new Date();
      this.preferences.set(userId, prefs);

      this.logger.log(`Imported preferences for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to import preferences: ${error.message}`);
      return false;
    }
  }

  private createDefaultPreferences(userId: string): UserNotificationPreferences {
    const defaultChannelPref: ChannelPreference = {
      enabled: true,
      frequency: 'instant',
    };

    return {
      userId,
      categories: {
        [NotificationCategory.MENTIONS]: {
          [NotificationChannel.EMAIL]: { ...defaultChannelPref },
          [NotificationChannel.PUSH]: { ...defaultChannelPref },
          [NotificationChannel.IN_APP]: { ...defaultChannelPref },
          [NotificationChannel.SMS]: { enabled: false },
          [NotificationChannel.SLACK]: { enabled: false },
        },
        [NotificationCategory.DEADLINES]: {
          [NotificationChannel.EMAIL]: { ...defaultChannelPref },
          [NotificationChannel.PUSH]: { ...defaultChannelPref },
          [NotificationChannel.IN_APP]: { ...defaultChannelPref },
          [NotificationChannel.SMS]: { enabled: true, frequency: 'instant' },
          [NotificationChannel.SLACK]: { enabled: false },
        },
        [NotificationCategory.SECURITY]: {
          [NotificationChannel.EMAIL]: { ...defaultChannelPref },
          [NotificationChannel.PUSH]: { ...defaultChannelPref },
          [NotificationChannel.IN_APP]: { ...defaultChannelPref },
          [NotificationChannel.SMS]: { enabled: true, frequency: 'instant' },
          [NotificationChannel.SLACK]: { enabled: false },
        },
      },
      doNotDisturb: false,
      updatedAt: new Date(),
    };
  }

  private isInDndSchedule(schedule: {
    start: string;
    end: string;
    timezone: string;
    days?: number[];
  }): boolean {
    // This would need proper timezone handling in production
    // For now, simplified implementation
    const now = new Date();
    const currentDay = now.getDay();

    if (schedule.days && !schedule.days.includes(currentDay)) {
      return false;
    }

    // Compare times (simplified)
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= schedule.start && currentTime <= schedule.end;
  }

  private isInQuietHours(quietHours: {
    start: string;
    end: string;
    timezone: string;
  }): boolean {
    // Similar to isInDndSchedule but without day checking
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalUsers: number;
    dndEnabled: number;
    averageEnabledChannels: number;
  } {
    let dndEnabled = 0;
    let totalEnabledChannels = 0;

    this.preferences.forEach((prefs) => {
      if (prefs.doNotDisturb) {
        dndEnabled++;
      }

      Object.values(prefs.categories).forEach((category) => {
        Object.values(category).forEach((channel) => {
          if (channel.enabled) {
            totalEnabledChannels++;
          }
        });
      });
    });

    return {
      totalUsers: this.preferences.size,
      dndEnabled,
      averageEnabledChannels:
        this.preferences.size > 0
          ? totalEnabledChannels / this.preferences.size
          : 0,
    };
  }
}
