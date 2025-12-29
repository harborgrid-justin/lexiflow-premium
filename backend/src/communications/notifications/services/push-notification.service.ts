import { Injectable, Logger } from '@nestjs/common';
import { PushPayload, PushServiceConfig, DeliveryAttempt } from '../types';

/**
 * Push Notification Service
 *
 * Handles push notification delivery with:
 * - Multiple provider support (FCM for Android/Web, APNs for iOS)
 * - Retry logic with exponential backoff
 * - Error handling and logging
 * - Device token management
 * - Badge count management
 * - Rich notifications support
 *
 * In production, integrate with actual push providers:
 * - FCM: firebase-admin
 * - APNs: node-apn or @parse/node-apn
 *
 * @class PushNotificationService
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private config: PushServiceConfig;
  private invalidTokens: Set<string> = new Set();

  constructor() {
    // Default configuration - in production, load from environment/config service
    this.config = {
      provider: 'fcm',
      maxRetries: 3,
      retryDelayMs: 1000,
      retryBackoffMultiplier: 2,
      timeout: 30000,
      // FCM config
      fcmServerKey: process.env.FCM_SERVER_KEY,
      // APNs config
      apnsCertPath: process.env.APNS_CERT_PATH,
      apnsKeyPath: process.env.APNS_KEY_PATH,
      apnsTeamId: process.env.APNS_TEAM_ID,
      apnsKeyId: process.env.APNS_KEY_ID,
      apnsBundleId: process.env.APNS_BUNDLE_ID || 'com.lexiflow.app',
    };

    this.logger.log(`PushNotificationService initialized with provider: ${this.config.provider}`);
  }

  /**
   * Send push notification with retry logic
   */
  async send(payload: PushPayload): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    attempts: DeliveryAttempt[];
    failedTokens?: string[];
  }> {
    // Validate device tokens
    const validTokens = this.filterValidTokens(payload.deviceTokens);

    if (validTokens.length === 0) {
      return {
        success: false,
        error: 'No valid device tokens',
        attempts: [],
        failedTokens: payload.deviceTokens,
      };
    }

    const attempts: DeliveryAttempt[] = [];
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Push notification delivery attempt ${attempt}/${this.config.maxRetries} to ${validTokens.length} devices`,
        );

        const result = await this.deliverPushNotification({
          ...payload,
          deviceTokens: validTokens,
        });

        const attemptRecord: DeliveryAttempt = {
          attemptNumber: attempt,
          timestamp: new Date(),
          success: true,
          messageId: result.messageId,
        };
        attempts.push(attemptRecord);

        this.logger.log(
          `Push notification delivered successfully to ${validTokens.length} devices (messageId: ${result.messageId})`,
        );

        // Mark failed tokens as invalid
        if (result.failedTokens && result.failedTokens.length > 0) {
          result.failedTokens.forEach(token => this.invalidTokens.add(token));
        }

        return {
          success: true,
          messageId: result.messageId,
          attempts,
          failedTokens: result.failedTokens,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        lastError = errorMessage;

        const attemptRecord: DeliveryAttempt = {
          attemptNumber: attempt,
          timestamp: new Date(),
          success: false,
          error: errorMessage,
        };
        attempts.push(attemptRecord);

        this.logger.warn(
          `Push notification delivery attempt ${attempt} failed: ${errorMessage}`,
        );

        // Wait before retry (with exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `Push notification delivery failed after ${this.config.maxRetries} attempts: ${lastError}`,
    );

    return {
      success: false,
      error: lastError,
      attempts,
    };
  }

  /**
   * Deliver push notification via configured provider
   */
  private async deliverPushNotification(payload: PushPayload): Promise<{
    messageId: string;
    failedTokens?: string[];
  }> {
    switch (this.config.provider) {
      case 'fcm':
        return await this.sendViaFCM(payload);
      case 'apns':
        return await this.sendViaAPNs(payload);
      default:
        throw new Error(`Unsupported push provider: ${this.config.provider}`);
    }
  }

  /**
   * Send push notification via Firebase Cloud Messaging (FCM)
   */
  private async sendViaFCM(payload: PushPayload): Promise<{
    messageId: string;
    failedTokens?: string[];
  }> {
    // In production, use firebase-admin
    // const admin = require('firebase-admin');
    //
    // const message = {
    //   notification: {
    //     title: payload.title,
    //     body: payload.body,
    //   },
    //   data: payload.data,
    //   android: {
    //     priority: payload.priority === 'high' ? 'high' : 'normal',
    //     notification: {
    //       sound: payload.sound || 'default',
    //     },
    //   },
    //   apns: {
    //     payload: {
    //       aps: {
    //         badge: payload.badge,
    //         sound: payload.sound || 'default',
    //       },
    //     },
    //   },
    //   tokens: payload.deviceTokens,
    // };
    //
    // const response = await admin.messaging().sendMulticast(message);
    //
    // const failedTokens: string[] = [];
    // response.responses.forEach((resp, idx) => {
    //   if (!resp.success) {
    //     failedTokens.push(payload.deviceTokens[idx]);
    //   }
    // });
    //
    // return {
    //   messageId: `fcm-${Date.now()}`,
    //   failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
    // };

    this.logger.debug(
      `[FCM Mock] Sending push notification to ${payload.deviceTokens.length} devices: ${payload.title}`,
    );

    return {
      messageId: `fcm-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      failedTokens: undefined,
    };
  }

  /**
   * Send push notification via Apple Push Notification service (APNs)
   */
  private async sendViaAPNs(payload: PushPayload): Promise<{
    messageId: string;
    failedTokens?: string[];
  }> {
    // In production, use node-apn or @parse/node-apn
    // const apn = require('node-apn');
    //
    // const provider = new apn.Provider({
    //   token: {
    //     key: this.config.apnsKeyPath,
    //     keyId: this.config.apnsKeyId,
    //     teamId: this.config.apnsTeamId,
    //   },
    //   production: process.env.NODE_ENV === 'production',
    // });
    //
    // const notification = new apn.Notification({
    //   alert: {
    //     title: payload.title,
    //     body: payload.body,
    //   },
    //   badge: payload.badge,
    //   sound: payload.sound || 'default',
    //   topic: this.config.apnsBundleId,
    //   payload: payload.data,
    //   priority: payload.priority === 'high' ? 10 : 5,
    // });
    //
    // const results = await provider.send(notification, payload.deviceTokens);
    //
    // const failedTokens: string[] = [];
    // results.failed.forEach(failure => {
    //   failedTokens.push(failure.device);
    // });
    //
    // provider.shutdown();
    //
    // return {
    //   messageId: `apns-${Date.now()}`,
    //   failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
    // };

    this.logger.debug(
      `[APNs Mock] Sending push notification to ${payload.deviceTokens.length} devices: ${payload.title}`,
    );

    return {
      messageId: `apns-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      failedTokens: undefined,
    };
  }

  /**
   * Filter out invalid device tokens
   */
  private filterValidTokens(tokens: string[]): string[] {
    return tokens.filter(token => {
      if (!token || token.trim().length === 0) {
        return false;
      }
      if (this.invalidTokens.has(token)) {
        this.logger.debug(`Skipping invalid token: ${token.substring(0, 10)}...`);
        return false;
      }
      return true;
    });
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptNumber: number): number {
    return this.config.retryDelayMs * Math.pow(this.config.retryBackoffMultiplier, attemptNumber - 1);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Register device token
   */
  registerToken(token: string): void {
    if (this.invalidTokens.has(token)) {
      this.invalidTokens.delete(token);
      this.logger.log(`Device token re-registered: ${token.substring(0, 10)}...`);
    }
  }

  /**
   * Unregister device token
   */
  unregisterToken(token: string): void {
    this.invalidTokens.add(token);
    this.logger.log(`Device token unregistered: ${token.substring(0, 10)}...`);
  }

  /**
   * Clear invalid tokens cache
   */
  clearInvalidTokens(): void {
    const count = this.invalidTokens.size;
    this.invalidTokens.clear();
    this.logger.log(`Cleared ${count} invalid device tokens`);
  }

  /**
   * Get invalid tokens count
   */
  getInvalidTokensCount(): number {
    return this.invalidTokens.size;
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<PushServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Push notification service configuration updated');
  }

  /**
   * Get current configuration (sensitive data redacted)
   */
  getConfig(): Omit<PushServiceConfig, 'fcmServerKey' | 'apnsKeyPath' | 'apnsCertPath'> {
    const { fcmServerKey, apnsKeyPath, apnsCertPath, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Send to topic (for FCM)
   */
  async sendToTopic(
    topic: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // In production, use firebase-admin sendToTopic
    this.logger.debug(`[FCM Mock] Sending to topic ${topic}: ${notification.title}`);

    return {
      success: true,
      messageId: `topic-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  /**
   * Subscribe tokens to topic
   */
  async subscribeToTopic(
    tokens: string[],
    topic: string,
  ): Promise<{ success: boolean; error?: string }> {
    // In production, use firebase-admin subscribeToTopic
    this.logger.debug(`Subscribing ${tokens.length} tokens to topic: ${topic}`);

    return { success: true };
  }

  /**
   * Unsubscribe tokens from topic
   */
  async unsubscribeFromTopic(
    tokens: string[],
    topic: string,
  ): Promise<{ success: boolean; error?: string }> {
    // In production, use firebase-admin unsubscribeFromTopic
    this.logger.debug(`Unsubscribing ${tokens.length} tokens from topic: ${topic}`);

    return { success: true };
  }
}
