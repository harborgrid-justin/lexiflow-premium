import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import Stripe from 'stripe';
import { PaymentGatewayService } from './payment-gateway.service';

export enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  CUSTOM = 'CUSTOM',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  TRIAL = 'TRIAL',
}

export interface RecurringBilling {
  id: string;
  clientId: string;
  matterId?: string;
  amount: number;
  currency: string;
  frequency: BillingFrequency;
  startDate: Date;
  nextBillingDate: Date;
  endDate?: Date;
  status: SubscriptionStatus;
  description: string;
  customDays?: number; // For custom frequency
  stripeSubscriptionId?: string;
  paymentMethodId: string;
  retryAttempts: number;
  lastBillingDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  frequency: BillingFrequency;
  trialDays?: number;
  features: string[];
  isActive: boolean;
}

export interface BillingCycle {
  id: string;
  subscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  status: 'pending' | 'billed' | 'paid' | 'failed';
  invoiceId?: string;
  paymentId?: string;
  attemptCount: number;
  nextRetryDate?: Date;
}

@Injectable()
export class RecurringBillingService {
  private readonly logger = new Logger(RecurringBillingService.name);
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_DAYS = 3;

  constructor(
    private paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Create a new recurring billing subscription
   */
  async createSubscription(
    clientId: string,
    amount: number,
    frequency: BillingFrequency,
    paymentMethodId: string,
    options: {
      matterId?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      customDays?: number;
      currency?: string;
      trialDays?: number;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<RecurringBilling> {
    try {
      const startDate = options.startDate || new Date();
      const nextBillingDate = options.trialDays
        ? this.addDays(startDate, options.trialDays)
        : this.calculateNextBillingDate(startDate, frequency, options.customDays);

      // Create subscription in payment gateway
      const stripeSubscriptionId = await this.createStripeSubscription(
        clientId,
        amount,
        frequency,
        paymentMethodId,
        options.trialDays,
      );

      const subscription: RecurringBilling = {
        id: this.generateId(),
        clientId,
        matterId: options.matterId,
        amount,
        currency: options.currency || 'usd',
        frequency,
        startDate,
        nextBillingDate,
        endDate: options.endDate,
        status: options.trialDays ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
        description: options.description || 'Recurring legal services',
        customDays: options.customDays,
        stripeSubscriptionId,
        paymentMethodId,
        retryAttempts: 0,
        metadata: options.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.log(`Created subscription: ${subscription.id} for client: ${clientId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Stripe subscription
   */
  private async createStripeSubscription(
    clientId: string,
    amount: number,
    frequency: BillingFrequency,
    paymentMethodId: string,
    trialDays?: number,
  ): Promise<string> {
    // This would integrate with Stripe's subscription API
    // For now, return a mock ID
    return `sub_${Date.now()}`;
  }

  /**
   * Update subscription details
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Partial<RecurringBilling>,
  ): Promise<RecurringBilling> {
    try {
      // Fetch existing subscription (mock implementation)
      const subscription = await this.getSubscription(subscriptionId);

      const updated: RecurringBilling = {
        ...subscription,
        ...updates,
        updatedAt: new Date(),
      };

      // Recalculate next billing date if frequency changed
      if (updates.frequency && updates.frequency !== subscription.frequency) {
        updated.nextBillingDate = this.calculateNextBillingDate(
          new Date(),
          updates.frequency,
          updates.customDays,
        );
      }

      this.logger.log(`Updated subscription: ${subscriptionId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false,
  ): Promise<RecurringBilling> {
    try {
      const subscription = await this.getSubscription(subscriptionId);

      if (immediate) {
        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.endDate = new Date();
      } else {
        // Cancel at end of current billing period
        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.endDate = subscription.nextBillingDate;
      }

      subscription.updatedAt = new Date();

      // Cancel in Stripe
      if (subscription.stripeSubscriptionId) {
        await this.cancelStripeSubscription(subscription.stripeSubscriptionId, immediate);
      }

      this.logger.log(`Cancelled subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw error;
    }
  }

  private async cancelStripeSubscription(stripeSubscriptionId: string, immediate: boolean): Promise<void> {
    // Stripe cancellation logic
    this.logger.log(`Cancelled Stripe subscription: ${stripeSubscriptionId}`);
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string, resumeDate?: Date): Promise<RecurringBilling> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      subscription.status = SubscriptionStatus.PAUSED;
      subscription.metadata = {
        ...subscription.metadata,
        pausedAt: new Date(),
        resumeDate,
      };
      subscription.updatedAt = new Date();

      this.logger.log(`Paused subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to pause subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<RecurringBilling> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.nextBillingDate = this.calculateNextBillingDate(
        new Date(),
        subscription.frequency,
        subscription.customDays,
      );
      subscription.updatedAt = new Date();

      delete subscription.metadata?.pausedAt;
      delete subscription.metadata?.resumeDate;

      this.logger.log(`Resumed subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to resume subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process due subscriptions - runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processDueSubscriptions(): Promise<void> {
    this.logger.log('Processing due subscriptions...');

    try {
      const dueSubscriptions = await this.getDueSubscriptions();
      this.logger.log(`Found ${dueSubscriptions.length} due subscriptions`);

      for (const subscription of dueSubscriptions) {
        await this.processSingleSubscription(subscription);
      }

      this.logger.log('Completed processing due subscriptions');
    } catch (error) {
      this.logger.error(`Error processing due subscriptions: ${error.message}`);
    }
  }

  /**
   * Get subscriptions due for billing
   */
  private async getDueSubscriptions(): Promise<RecurringBilling[]> {
    // Mock implementation - would query database
    return [];
  }

  /**
   * Process a single subscription billing
   */
  private async processSingleSubscription(subscription: RecurringBilling): Promise<void> {
    try {
      this.logger.log(`Processing subscription: ${subscription.id}`);

      // Create invoice
      const invoice = await this.createSubscriptionInvoice(subscription);

      // Process payment
      const payment = await this.paymentGatewayService.createStripePaymentIntent(
        subscription.amount,
        subscription.currency,
        {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          clientId: subscription.clientId,
        },
      );

      // Update subscription
      subscription.lastBillingDate = new Date();
      subscription.nextBillingDate = this.calculateNextBillingDate(
        subscription.nextBillingDate,
        subscription.frequency,
        subscription.customDays,
      );
      subscription.retryAttempts = 0;
      subscription.updatedAt = new Date();

      this.logger.log(`Successfully processed subscription: ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Failed to process subscription ${subscription.id}: ${error.message}`);
      await this.handleFailedBilling(subscription);
    }
  }

  /**
   * Handle failed billing attempt
   */
  private async handleFailedBilling(subscription: RecurringBilling): Promise<void> {
    subscription.retryAttempts++;

    if (subscription.retryAttempts >= this.MAX_RETRY_ATTEMPTS) {
      subscription.status = SubscriptionStatus.UNPAID;
      this.logger.warn(`Subscription ${subscription.id} marked as UNPAID after ${this.MAX_RETRY_ATTEMPTS} attempts`);
    } else {
      subscription.status = SubscriptionStatus.PAST_DUE;
      subscription.nextBillingDate = this.addDays(new Date(), this.RETRY_DELAY_DAYS);
      this.logger.warn(`Subscription ${subscription.id} retry scheduled for ${subscription.nextBillingDate}`);
    }

    subscription.updatedAt = new Date();
  }

  /**
   * Create invoice for subscription
   */
  private async createSubscriptionInvoice(subscription: RecurringBilling): Promise<any> {
    const invoice = {
      id: this.generateId(),
      subscriptionId: subscription.id,
      clientId: subscription.clientId,
      amount: subscription.amount,
      currency: subscription.currency,
      description: subscription.description,
      dueDate: new Date(),
      status: 'pending',
    };

    return invoice;
  }

  /**
   * Calculate next billing date based on frequency
   */
  private calculateNextBillingDate(
    currentDate: Date,
    frequency: BillingFrequency,
    customDays?: number,
  ): Date {
    const date = new Date(currentDate);

    switch (frequency) {
      case BillingFrequency.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case BillingFrequency.QUARTERLY:
        date.setMonth(date.getMonth() + 3);
        break;
      case BillingFrequency.SEMI_ANNUAL:
        date.setMonth(date.getMonth() + 6);
        break;
      case BillingFrequency.ANNUAL:
        date.setFullYear(date.getFullYear() + 1);
        break;
      case BillingFrequency.CUSTOM:
        if (customDays) {
          date.setDate(date.getDate() + customDays);
        }
        break;
    }

    return date;
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<RecurringBilling> {
    // Mock implementation
    throw new NotFoundException(`Subscription ${subscriptionId} not found`);
  }

  /**
   * Get all subscriptions for a client
   */
  async getClientSubscriptions(clientId: string, status?: SubscriptionStatus): Promise<RecurringBilling[]> {
    // Mock implementation - would query database
    return [];
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(clientId?: string): Promise<any> {
    // Mock implementation
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      monthlyRecurringRevenue: 0,
      annualRecurringRevenue: 0,
      churnRate: 0,
      averageSubscriptionValue: 0,
      subscriptionsByStatus: {},
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Preview upcoming charges
   */
  async previewUpcomingCharges(clientId: string, daysAhead: number = 30): Promise<any[]> {
    const subscriptions = await this.getClientSubscriptions(clientId, SubscriptionStatus.ACTIVE);
    const cutoffDate = this.addDays(new Date(), daysAhead);

    return subscriptions
      .filter(sub => sub.nextBillingDate <= cutoffDate)
      .map(sub => ({
        subscriptionId: sub.id,
        amount: sub.amount,
        currency: sub.currency,
        billingDate: sub.nextBillingDate,
        description: sub.description,
      }));
  }
}
