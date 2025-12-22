import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import axios from 'axios';
import * as MasterConfig from '../config/master.config';
import { CreateWebhookDto, UpdateWebhookDto, WebhookEvent, WebhookPayload, WebhookDelivery } from './dto';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  description?: string;
  active: boolean;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhooks = new Map<string, Webhook>();
  private readonly deliveries = new Map<string, WebhookDelivery>();
  private readonly maxRetries = MasterConfig.WEBHOOK_MAX_RETRIES;
  private readonly retryDelays = MasterConfig.WEBHOOK_RETRY_DELAYS;

  /**
   * Create a new webhook
   */
  async create(createWebhookDto: CreateWebhookDto, userId: string): Promise<Webhook> {
    const webhook: Webhook = {
      id: this.generateId(),
      ...createWebhookDto,
      active: createWebhookDto.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    };

    this.webhooks.set(webhook.id, webhook);
    this.logger.log(`Webhook created: ${webhook.id} for user ${userId}`);

    return webhook;
  }

  /**
   * Find all webhooks for a user
   */
  async findAll(userId: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.userId === userId);
  }

  /**
   * Find one webhook by ID
   */
  async findOne(id: string, userId: string): Promise<Webhook> {
    const webhook = this.webhooks.get(id);

    if (!webhook || webhook.userId !== userId) {
      throw new NotFoundException(`Webhook with ID ${id} not found`);
    }

    return webhook;
  }

  /**
   * Update a webhook
   */
  async update(id: string, updateWebhookDto: UpdateWebhookDto, userId: string): Promise<Webhook> {
    const webhook = await this.findOne(id, userId);

    const updated: Webhook = {
      ...webhook,
      ...updateWebhookDto,
      updatedAt: new Date(),
    };

    this.webhooks.set(id, updated);
    this.logger.log(`Webhook updated: ${id}`);

    return updated;
  }

  /**
   * Delete a webhook
   */
  async remove(id: string, userId: string): Promise<void> {
    const _webhook = await this.findOne(id, userId);
    this.webhooks.delete(id);
    this.logger.log(`Webhook deleted: ${id}`);
  }

  /**
   * Test a webhook by sending a test event
   */
  async test(id: string, userId: string): Promise<WebhookDelivery> {
    const webhook = await this.findOne(id, userId);

    const testPayload: WebhookPayload = {
      event: WebhookEvent.CASE_CREATED,
      timestamp: new Date(),
      data: {
        test: true,
        message: 'This is a test webhook delivery',
      },
      webhookId: webhook.id,
      deliveryId: this.generateId(),
    };

    return this.deliver(webhook, testPayload);
  }

  /**
   * Trigger a webhook event
   */
  async trigger(event: WebhookEvent, data: any): Promise<void> {
    const webhooks = Array.from(this.webhooks.values()).filter(
      w => w.active && w.events.includes(event),
    );

    this.logger.log(`Triggering event ${event} for ${webhooks.length} webhooks`);

    for (const webhook of webhooks) {
      const payload: WebhookPayload = {
        event,
        timestamp: new Date(),
        data,
        webhookId: webhook.id,
        deliveryId: this.generateId(),
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        payload.signature = this.generateSignature(payload, webhook.secret);
      }

      await this.deliver(webhook, payload);
    }
  }

  /**
   * Deliver a webhook payload
   */
  private async deliver(webhook: Webhook, payload: WebhookPayload): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: payload.deliveryId,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deliveries.set(delivery.id, delivery);

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': payload.signature || '',
          'X-Webhook-Event': payload.event,
          'X-Webhook-Delivery': payload.deliveryId,
          ...webhook.headers,
        },
        timeout: MasterConfig.WEBHOOK_TIMEOUT_MS,
      });

      delivery.status = 'success';
      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();
      delivery.response = {
        statusCode: response.status,
        body: response.data,
        headers: response.headers as Record<string, string>,
      };

      this.logger.log(`Webhook delivered successfully: ${delivery.id} to ${webhook.url}`);
    } catch (error: any) {
      delivery.status = 'failed';
      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();
      delivery.error = error.message;

      if (delivery.attempts < this.maxRetries) {
        delivery.nextRetryAt = new Date(
          Date.now() + this.retryDelays[delivery.attempts - 1],
        );
      }

      this.logger.error(
        `Webhook delivery failed: ${delivery.id} to ${webhook.url}`,
        error.stack,
      );
    }

    delivery.updatedAt = new Date();
    this.deliveries.set(delivery.id, delivery);

    return delivery;
  }

  /**
   * Get webhook deliveries
   */
  async getDeliveries(webhookId: string, userId: string): Promise<WebhookDelivery[]> {
    const webhook = await this.findOne(webhookId, userId);

    return Array.from(this.deliveries.values())
      .filter(d => d.webhookId === webhook.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Retry failed webhook deliveries (runs every 5 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedDeliveries(): Promise<void> {
    const now = new Date();
    const failedDeliveries = Array.from(this.deliveries.values()).filter(
      d => d.status === 'failed' &&
           d.attempts < this.maxRetries &&
           d.nextRetryAt &&
           d.nextRetryAt <= now,
    );

    this.logger.log(`Retrying ${failedDeliveries.length} failed webhook deliveries`);

    for (const delivery of failedDeliveries) {
      const webhook = this.webhooks.get(delivery.webhookId);
      if (webhook && webhook.active) {
        await this.deliver(webhook, delivery.payload);
      }
    }
  }

  /**
   * Generate a signature for webhook payload verification
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
