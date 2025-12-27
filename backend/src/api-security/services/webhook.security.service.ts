import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import * as MasterConfig from '../../config/master.config';

export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  url: string;
  payload: WebhookPayload;
  signature: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  error?: string;
  responseStatus?: number;
  responseBody?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  maxRetries?: number;
  timeoutMs?: number;
}

@Injectable()
export class WebhookSecurityService implements OnModuleDestroy {
  private readonly logger = new Logger(WebhookSecurityService.name);
  private readonly deliveries = new Map<string, WebhookDelivery>();
  private readonly webhooks = new Map<string, WebhookConfig>();
  private retryInterval: NodeJS.Timeout | null = null;
  private readonly algorithm = MasterConfig.WEBHOOK_SIGNATURE_ALGORITHM;

  constructor() {
    // Process retries every minute
    this.retryInterval = setInterval(() => this.processRetries(), 60000);
  }

  onModuleDestroy() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }

  registerWebhook(config: WebhookConfig): void {
    this.webhooks.set(config.id, config);
    this.logger.log(`Registered webhook ${config.id} for URL: ${config.url}`);
  }

  unregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
    this.logger.log(`Unregistered webhook ${webhookId}`);
  }

  generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac(this.algorithm, secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  async sendWebhook(webhookId: string, event: string, data: any, metadata?: Record<string, any>): Promise<WebhookDelivery> {
    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    if (!webhook.active) {
      throw new Error(`Webhook ${webhookId} is not active`);
    }

    if (!webhook.events.includes(event) && !webhook.events.includes('*')) {
      this.logger.debug(`Webhook ${webhookId} not subscribed to event ${event}`);
      throw new Error(`Webhook ${webhookId} not subscribed to event ${event}`);
    }

    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      data,
      metadata,
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, webhook.secret);

    const delivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      webhookId,
      url: webhook.url,
      payload,
      signature,
      status: 'pending',
      attempts: 0,
      maxAttempts: webhook.maxRetries || MasterConfig.WEBHOOK_MAX_RETRIES,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deliveries.set(delivery.id, delivery);

    // Attempt immediate delivery
    await this.attemptDelivery(delivery, webhook);

    return delivery;
  }

  private async attemptDelivery(delivery: WebhookDelivery, webhook: WebhookConfig): Promise<void> {
    delivery.attempts++;
    delivery.lastAttemptAt = new Date();
    delivery.updatedAt = new Date();

    const payloadString = JSON.stringify(delivery.payload);
    const timeoutMs = webhook.timeoutMs || MasterConfig.WEBHOOK_TIMEOUT_MS;

    try {
      this.logger.debug(
        `Attempting webhook delivery ${delivery.id} (attempt ${delivery.attempts}/${delivery.maxAttempts}) to ${webhook.url}`
      );

      const response = await axios.post(webhook.url, delivery.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': delivery.signature,
          'X-Webhook-Signature-Algorithm': this.algorithm,
          'X-Webhook-Timestamp': delivery.payload.timestamp.toString(),
          'X-Webhook-Event': delivery.payload.event,
          'X-Webhook-Delivery-Id': delivery.id,
        },
        timeout: timeoutMs,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      delivery.status = 'delivered';
      delivery.deliveredAt = new Date();
      delivery.responseStatus = response.status;
      delivery.responseBody = JSON.stringify(response.data).substring(0, 1000);

      this.logger.log(
        `Webhook delivery ${delivery.id} successful to ${webhook.url} (status: ${response.status})`
      );
    } catch (error) {
      const axiosError = error as AxiosError;

      delivery.responseStatus = axiosError.response?.status;
      delivery.responseBody = axiosError.response?.data
        ? JSON.stringify(axiosError.response.data).substring(0, 1000)
        : axiosError.message;
      delivery.error = axiosError.message;

      if (delivery.attempts >= delivery.maxAttempts) {
        delivery.status = 'failed';
        delivery.failedAt = new Date();

        this.logger.error(
          `Webhook delivery ${delivery.id} failed permanently after ${delivery.attempts} attempts: ${delivery.error}`
        );
      } else {
        delivery.status = 'retrying';

        // Calculate exponential backoff
        const retryDelay = this.calculateRetryDelay(delivery.attempts);
        delivery.nextRetryAt = new Date(Date.now() + retryDelay);

        this.logger.warn(
          `Webhook delivery ${delivery.id} failed (attempt ${delivery.attempts}/${delivery.maxAttempts}), ` +
          `will retry at ${delivery.nextRetryAt.toISOString()}: ${delivery.error}`
        );
      }
    }

    this.deliveries.set(delivery.id, delivery);
  }

  private calculateRetryDelay(attempt: number): number {
    // Use configured delays if available
    if (MasterConfig.WEBHOOK_RETRY_DELAYS && MasterConfig.WEBHOOK_RETRY_DELAYS[attempt - 1]) {
      return MasterConfig.WEBHOOK_RETRY_DELAYS[attempt - 1];
    }

    // Exponential backoff: 2^attempt * 1000ms with max of 15 minutes
    const delay = Math.min(Math.pow(2, attempt) * 1000, 900000);
    return delay;
  }

  private async processRetries(): Promise<void> {
    const now = new Date();
    const retriesProcessed: string[] = [];

    for (const [deliveryId, delivery] of this.deliveries.entries()) {
      if (delivery.status === 'retrying' && delivery.nextRetryAt && delivery.nextRetryAt <= now) {
        const webhook = this.webhooks.get(delivery.webhookId);

        if (webhook) {
          retriesProcessed.push(deliveryId);
          await this.attemptDelivery(delivery, webhook);
        }
      }
    }

    if (retriesProcessed.length > 0) {
      this.logger.debug(`Processed ${retriesProcessed.length} webhook retries`);
    }

    // Cleanup old completed deliveries (older than 7 days)
    this.cleanupOldDeliveries();
  }

  private cleanupOldDeliveries(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [deliveryId, delivery] of this.deliveries.entries()) {
      if (
        (delivery.status === 'delivered' || delivery.status === 'failed') &&
        delivery.updatedAt < sevenDaysAgo
      ) {
        this.deliveries.delete(deliveryId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} old webhook deliveries`);
    }
  }

  getDelivery(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveries.get(deliveryId);
  }

  getDeliveriesForWebhook(webhookId: string): WebhookDelivery[] {
    return Array.from(this.deliveries.values())
      .filter(d => d.webhookId === webhookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getRecentDeliveries(limit: number = 100): WebhookDelivery[] {
    return Array.from(this.deliveries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getDeliveryStats(webhookId: string): {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    retrying: number;
    successRate: number;
  } {
    const deliveries = this.getDeliveriesForWebhook(webhookId);

    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;
    const failed = deliveries.filter(d => d.status === 'failed').length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const retrying = deliveries.filter(d => d.status === 'retrying').length;
    const successRate = total > 0 ? (delivered / total) * 100 : 0;

    return {
      total,
      delivered,
      failed,
      pending,
      retrying,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);

    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    if (delivery.status === 'delivered') {
      throw new Error(`Delivery ${deliveryId} already delivered`);
    }

    const webhook = this.webhooks.get(delivery.webhookId);

    if (!webhook) {
      throw new Error(`Webhook ${delivery.webhookId} not found`);
    }

    // Reset status for retry
    delivery.status = 'pending';
    delivery.nextRetryAt = undefined;

    await this.attemptDelivery(delivery, webhook);
  }

  verifyWebhookRequest(payload: string, signature: string, secret: string, timestampHeader?: string): boolean {
    // Verify signature
    if (!this.verifySignature(payload, signature, secret)) {
      this.logger.warn('Webhook signature verification failed');
      return false;
    }

    // Verify timestamp to prevent replay attacks
    if (timestampHeader) {
      const timestamp = parseInt(timestampHeader, 10);
      const now = Date.now();
      const diff = Math.abs(now - timestamp);

      // Allow 5 minute tolerance
      if (diff > 300000) {
        this.logger.warn(`Webhook timestamp too old or in future. Diff: ${diff}ms`);
        return false;
      }
    }

    return true;
  }

  private generateDeliveryId(): string {
    return `whd_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}
