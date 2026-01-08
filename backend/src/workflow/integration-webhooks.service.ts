import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint, WebhookEvent, WebhookMethod, WebhookStatus } from './entities/webhook-endpoint.entity';
import * as crypto from 'crypto';

export interface WebhookDelivery {
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  timestamp: Date;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * IntegrationWebhooksService
 * Manages webhook integrations and event delivery
 */
@Injectable()
export class IntegrationWebhooksService {
  private readonly logger = new Logger(IntegrationWebhooksService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly webhookRepo: Repository<WebhookEndpoint>,
  ) {}

  /**
   * Trigger webhook for an event
   */
  async triggerWebhook(tenantId: string, event: WebhookEvent | string, payload: Record<string, any>): Promise<void> {
    this.logger.log(`Triggering webhooks for event: ${event} in tenant ${tenantId}`);

    try {
      // Find matching webhooks
      const webhooks = await this.findMatchingWebhooks(tenantId, event as WebhookEvent);

      if (webhooks.length === 0) {
        this.logger.debug(`No webhooks configured for event: ${event}`);
        return;
      }

      // Deliver to all matching webhooks
      const deliveries = webhooks.map((webhook) =>
        this.deliverWebhook(webhook, event as WebhookEvent, payload),
      );

      await Promise.allSettled(deliveries);
    } catch (error: any) {
      this.logger.error(`Error triggering webhooks: ${error.message}`);
    }
  }

  /**
   * Find webhooks matching the event
   */
  private async findMatchingWebhooks(tenantId: string, event: WebhookEvent): Promise<WebhookEndpoint[]> {
    const webhooks = await this.webhookRepo
      .createQueryBuilder('webhook')
      .where('webhook.tenantId = :tenantId', { tenantId })
      .andWhere('webhook.active = :active', { active: true })
      .andWhere('webhook.status = :status', { status: WebhookStatus.ACTIVE })
      .getMany();

    // Filter by event
    return webhooks.filter((webhook) => {
      return webhook.events.includes(WebhookEvent.ALL) || webhook.events.includes(event);
    });
  }

  /**
   * Deliver webhook to endpoint
   */
  private async deliverWebhook(
    webhook: WebhookEndpoint,
    event: WebhookEvent,
    payload: Record<string, any>,
  ): Promise<void> {
    this.logger.debug(`Delivering webhook ${webhook.id} to ${webhook.url}`);

    const startTime = Date.now();
    let attempt = 0;
    let lastError: string | null = null;

    while (attempt <= webhook.retryCount) {
      try {
        const response = await this.makeWebhookRequest(webhook, event, payload);

        // Record success
        await this.recordWebhookSuccess(webhook, response.statusCode, Date.now() - startTime);

        this.logger.log(`Webhook ${webhook.id} delivered successfully (${response.statusCode})`);
        return;
      } catch (error: any) {
        lastError = error.message;
        this.logger.warn(`Webhook ${webhook.id} delivery attempt ${attempt + 1} failed: ${error.message}`);

        attempt++;

        if (attempt <= webhook.retryCount) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    await this.recordWebhookFailure(webhook, lastError || 'Unknown error');
  }

  /**
   * Make HTTP request to webhook endpoint
   */
  private async makeWebhookRequest(
    webhook: WebhookEndpoint,
    event: WebhookEvent,
    payload: Record<string, any>,
  ): Promise<{ statusCode: number; body: any }> {
    // Prepare payload
    const webhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Generate signature
    const signature = webhook.secret ? this.generateSignature(webhookPayload, webhook.secret) : undefined;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LexiFlow-Webhook/1.0',
      ...(webhook.headers || {}),
    };

    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    // Make request using fetch API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), webhook.timeoutSeconds * 1000);

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
        ...(webhook.verifySsl === false && { rejectUnauthorized: false }),
      });

      clearTimeout(timeout);

      const body = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        statusCode: response.status,
        body: body ? JSON.parse(body) : null,
      };
    } catch (error: any) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${webhook.timeoutSeconds} seconds`);
      }

      throw error;
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Record successful webhook delivery
   */
  private async recordWebhookSuccess(
    webhook: WebhookEndpoint,
    statusCode: number,
    responseTime: number,
  ): Promise<void> {
    const newSuccessCount = webhook.successCount + 1;
    const totalDeliveries = newSuccessCount + webhook.failureCount;
    const newAvgResponseTime =
      ((webhook.avgResponseTimeMs || 0) * (totalDeliveries - 1) + responseTime) / totalDeliveries;

    await this.webhookRepo.update(webhook.id, {
      successCount: newSuccessCount,
      lastDeliveredAt: new Date(),
      lastStatusCode: statusCode,
      lastError: null,
      avgResponseTimeMs: newAvgResponseTime,
      status: WebhookStatus.ACTIVE,
    });
  }

  /**
   * Record failed webhook delivery
   */
  private async recordWebhookFailure(webhook: WebhookEndpoint, error: string): Promise<void> {
    const newFailureCount = webhook.failureCount + 1;

    // Mark as error if too many failures
    const status = newFailureCount >= 10 ? WebhookStatus.ERROR : webhook.status;

    await this.webhookRepo.update(webhook.id, {
      failureCount: newFailureCount,
      lastDeliveredAt: new Date(),
      lastError: error,
      status,
    });
  }

  /**
   * Call external webhook directly (for workflow steps)
   */
  async callWebhook(
    url: string,
    method: string,
    payload: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<any> {
    this.logger.debug(`Calling external webhook: ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: JSON.stringify(payload),
      });

      const body = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return body ? JSON.parse(body) : null;
    } catch (error: any) {
      this.logger.error(`Webhook call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create webhook endpoint
   */
  async createWebhook(webhookData: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    // Generate secret if not provided
    if (!webhookData.secret) {
      webhookData.secret = this.generateSecret();
    }

    const webhook = this.webhookRepo.create(webhookData);
    return this.webhookRepo.save(webhook);
  }

  /**
   * Update webhook endpoint
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    await this.webhookRepo.update(webhookId, updates);
    return this.webhookRepo.findOne({ where: { id: webhookId } });
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.webhookRepo.delete(webhookId);
  }

  /**
   * Get webhook endpoint
   */
  async getWebhook(webhookId: string): Promise<WebhookEndpoint | null> {
    return this.webhookRepo.findOne({ where: { id: webhookId } });
  }

  /**
   * List webhooks for tenant
   */
  async listWebhooks(tenantId: string, filters?: { active?: boolean; event?: WebhookEvent }): Promise<WebhookEndpoint[]> {
    const query = this.webhookRepo
      .createQueryBuilder('webhook')
      .where('webhook.tenantId = :tenantId', { tenantId });

    if (filters?.active !== undefined) {
      query.andWhere('webhook.active = :active', { active: filters.active });
    }

    return query.orderBy('webhook.createdAt', 'DESC').getMany();
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean; message: string; statusCode?: number }> {
    const webhook = await this.webhookRepo.findOne({ where: { id: webhookId } });

    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook delivery from LexiFlow' },
      };

      const response = await this.makeWebhookRequest(webhook, 'test' as WebhookEvent, testPayload);

      return {
        success: true,
        message: 'Webhook test successful',
        statusCode: response.statusCode,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Activate/deactivate webhook
   */
  async toggleWebhookActive(webhookId: string, active: boolean): Promise<void> {
    await this.webhookRepo.update(webhookId, { active });
  }

  /**
   * Regenerate webhook secret
   */
  async regenerateSecret(webhookId: string): Promise<string> {
    const secret = this.generateSecret();
    await this.webhookRepo.update(webhookId, { secret });
    return secret;
  }

  /**
   * Generate random secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(webhookId: string): Promise<{
    totalDeliveries: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    avgResponseTime: number;
  }> {
    const webhook = await this.webhookRepo.findOne({ where: { id: webhookId } });

    if (!webhook) {
      return {
        totalDeliveries: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        avgResponseTime: 0,
      };
    }

    const totalDeliveries = webhook.successCount + webhook.failureCount;
    const successRate = totalDeliveries > 0 ? (webhook.successCount / totalDeliveries) * 100 : 0;

    return {
      totalDeliveries,
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      successRate,
      avgResponseTime: webhook.avgResponseTimeMs || 0,
    };
  }

  /**
   * Verify webhook signature (for incoming webhooks)
   */
  verifySignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }
}
