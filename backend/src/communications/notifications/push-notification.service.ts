import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private subscriptions = new Map<string, PushSubscription[]>(); // userId -> subscriptions
  private isConfigured = false;

  constructor() {
    this.initializeWebPush();
  }

  private initializeWebPush(): void {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@lexiflow.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will not work.',
      );
      return;
    }

    try {
      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey,
      );
      this.isConfigured = true;
      this.logger.log('Web Push configured successfully');
    } catch (error) {
      this.logger.error(`Failed to configure Web Push: ${error.message}`);
    }
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(
    userId: string,
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
    userAgent?: string,
  ): Promise<void> {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, []);
    }

    const userSubscriptions = this.subscriptions.get(userId)!;

    // Check if subscription already exists
    const existingIndex = userSubscriptions.findIndex(
      (s) => s.endpoint === subscription.endpoint,
    );

    const pushSubscription: PushSubscription = {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    if (existingIndex >= 0) {
      // Update existing subscription
      userSubscriptions[existingIndex] = pushSubscription;
    } else {
      // Add new subscription
      userSubscriptions.push(pushSubscription);
    }

    this.logger.log(`User ${userId} subscribed to push notifications`);
  }

  /**
   * Unsubscribe user from push notifications
   */
  unsubscribe(userId: string, endpoint: string): void {
    const userSubscriptions = this.subscriptions.get(userId);

    if (!userSubscriptions) {
      return;
    }

    const filtered = userSubscriptions.filter((s) => s.endpoint !== endpoint);

    if (filtered.length === 0) {
      this.subscriptions.delete(userId);
    } else {
      this.subscriptions.set(userId, filtered);
    }

    this.logger.log(`User ${userId} unsubscribed from push notifications`);
  }

  /**
   * Send push notification to user
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('Push notifications not configured');
      return;
    }

    const userSubscriptions = this.subscriptions.get(userId);

    if (!userSubscriptions || userSubscriptions.length === 0) {
      this.logger.debug(`No subscriptions found for user ${userId}`);
      return;
    }

    const payloadString = JSON.stringify(payload);
    const failedSubscriptions: string[] = [];

    // Send to all user's subscriptions
    for (const subscription of userSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payloadString,
        );

        subscription.lastUsed = new Date();
        this.logger.debug(
          `Push notification sent to user ${userId} (${subscription.endpoint})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send push notification to ${subscription.endpoint}: ${error.message}`,
        );

        // If subscription is invalid (410 Gone or 404), mark for removal
        if (error.statusCode === 410 || error.statusCode === 404) {
          failedSubscriptions.push(subscription.endpoint);
        }
      }
    }

    // Remove failed subscriptions
    if (failedSubscriptions.length > 0) {
      failedSubscriptions.forEach((endpoint) => {
        this.unsubscribe(userId, endpoint);
      });
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    await Promise.all(userIds.map((userId) => this.sendToUser(userId, payload)));
  }

  /**
   * Send broadcast push notification
   */
  async broadcast(payload: PushPayload, excludeUserIds?: string[]): Promise<void> {
    const userIds = Array.from(this.subscriptions.keys()).filter(
      (userId) => !excludeUserIds?.includes(userId),
    );

    await this.sendToUsers(userIds, payload);

    this.logger.log(`Broadcast push notification sent to ${userIds.length} users`);
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userId: string): PushSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  /**
   * Test push notification
   */
  async testPushNotification(userId: string): Promise<boolean> {
    try {
      await this.sendToUser(userId, {
        title: 'Test Notification',
        body: 'This is a test push notification from LexiFlow',
        icon: '/logo.png',
      });
      return true;
    } catch (error) {
      this.logger.error(`Test push notification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalUsers: number;
    totalSubscriptions: number;
    averageSubscriptionsPerUser: number;
  } {
    let totalSubscriptions = 0;

    this.subscriptions.forEach((subs) => {
      totalSubscriptions += subs.length;
    });

    return {
      totalUsers: this.subscriptions.size,
      totalSubscriptions,
      averageSubscriptionsPerUser:
        this.subscriptions.size > 0
          ? totalSubscriptions / this.subscriptions.size
          : 0,
    };
  }

  /**
   * Clean up stale subscriptions
   */
  cleanupStaleSubscriptions(maxAge: number = 90 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.subscriptions.forEach((subs, userId) => {
      const valid = subs.filter((s) => {
        const age = now - (s.lastUsed || s.createdAt).getTime();
        return age < maxAge;
      });

      cleanedCount += subs.length - valid.length;

      if (valid.length === 0) {
        this.subscriptions.delete(userId);
      } else {
        this.subscriptions.set(userId, valid);
      }
    });

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} stale push subscriptions`);
    }
  }

  /**
   * Send notification with retry
   */
  async sendWithRetry(
    userId: string,
    payload: PushPayload,
    maxRetries: number = 3,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendToUser(userId, payload);
        return true;
      } catch (error) {
        this.logger.warn(
          `Push notification attempt ${attempt} failed: ${error.message}`,
        );

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }
      }
    }

    return false;
  }

  /**
   * Get VAPID public key
   */
  getVapidPublicKey(): string | null {
    if (!this.isConfigured) {
      return null;
    }
    return process.env.VAPID_PUBLIC_KEY || null;
  }

  /**
   * Check if push notifications are configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }
}
