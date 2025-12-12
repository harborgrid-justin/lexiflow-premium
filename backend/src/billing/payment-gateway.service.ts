import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhook {
  event: string;
  data: any;
  signature: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private stripe: Stripe;
  private paypalClient: paypal.core.PayPalHttpClient;
  private readonly stripeWebhookSecret: string;

  constructor(private configService: ConfigService) {
    // Initialize Stripe
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
      this.stripeWebhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    }

    // Initialize PayPal
    const paypalClientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const paypalSecret = this.configService.get<string>('PAYPAL_SECRET');
    if (paypalClientId && paypalSecret) {
      const environment = this.configService.get<string>('NODE_ENV') === 'production'
        ? new paypal.core.LiveEnvironment(paypalClientId, paypalSecret)
        : new paypal.core.SandboxEnvironment(paypalClientId, paypalSecret);
      this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    }
  }

  /**
   * Create a payment intent with Stripe
   */
  async createStripePaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, any> = {},
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Created Stripe payment intent: ${paymentIntent.id}`);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to create Stripe payment intent: ${error.message}`);
      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * Create a PayPal order
   */
  async createPayPalOrder(
    amount: number,
    currency: string = 'USD',
    metadata: Record<string, any> = {},
  ): Promise<PaymentIntent> {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: metadata.description || 'Legal services payment',
          custom_id: metadata.invoiceId || '',
        }],
      });

      const response = await this.paypalClient.execute(request);
      const order = response.result;

      this.logger.log(`Created PayPal order: ${order.id}`);

      return {
        id: order.id,
        amount,
        currency: currency.toUpperCase(),
        status: order.status,
        metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to create PayPal order: ${error.message}`);
      throw new BadRequestException(`PayPal processing failed: ${error.message}`);
    }
  }

  /**
   * Capture a PayPal order
   */
  async capturePayPalOrder(orderId: string): Promise<any> {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.paypalClient.execute(request);
      this.logger.log(`Captured PayPal order: ${orderId}`);

      return response.result;
    } catch (error) {
      this.logger.error(`Failed to capture PayPal order: ${error.message}`);
      throw new BadRequestException(`PayPal capture failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment status
   */
  async getPaymentStatus(paymentId: string, gateway: 'stripe' | 'paypal' = 'stripe'): Promise<string> {
    try {
      if (gateway === 'stripe') {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
        return paymentIntent.status;
      } else {
        const request = new paypal.orders.OrdersGetRequest(paymentId);
        const response = await this.paypalClient.execute(request);
        return response.result.status;
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve payment status: ${error.message}`);
      throw new BadRequestException(`Failed to retrieve payment status`);
    }
  }

  /**
   * Process a refund
   */
  async processRefund(refundRequest: RefundRequest, gateway: 'stripe' | 'paypal' = 'stripe'): Promise<any> {
    try {
      if (gateway === 'stripe') {
        const refund = await this.stripe.refunds.create({
          payment_intent: refundRequest.paymentId,
          amount: refundRequest.amount ? Math.round(refundRequest.amount * 100) : undefined,
          reason: refundRequest.reason as any,
          metadata: refundRequest.metadata,
        });

        this.logger.log(`Processed Stripe refund: ${refund.id}`);
        return refund;
      } else {
        // PayPal refund logic
        const request = new paypal.payments.CapturesRefundRequest(refundRequest.paymentId);
        request.requestBody({
          amount: refundRequest.amount ? {
            value: refundRequest.amount.toFixed(2),
            currency_code: 'USD',
          } : undefined,
          note_to_payer: refundRequest.reason,
        });

        const response = await this.paypalClient.execute(request);
        this.logger.log(`Processed PayPal refund: ${response.result.id}`);
        return response.result;
      }
    } catch (error) {
      this.logger.error(`Failed to process refund: ${error.message}`);
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Save a payment method for future use
   */
  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      this.logger.log(`Saved payment method: ${paymentMethodId} for customer: ${customerId}`);

      return {
        id: paymentMethod.id,
        type: paymentMethod.type as any,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        isDefault: true,
      };
    } catch (error) {
      this.logger.error(`Failed to save payment method: ${error.message}`);
      throw new BadRequestException(`Failed to save payment method`);
    }
  }

  /**
   * List saved payment methods for a customer
   */
  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const customer = await this.stripe.customers.retrieve(customerId);
      const defaultPaymentMethodId = (customer as any).invoice_settings?.default_payment_method;

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type as any,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      }));
    } catch (error) {
      this.logger.error(`Failed to list payment methods: ${error.message}`);
      throw new BadRequestException(`Failed to retrieve payment methods`);
    }
  }

  /**
   * Remove a saved payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      this.logger.log(`Removed payment method: ${paymentMethodId}`);
    } catch (error) {
      this.logger.error(`Failed to remove payment method: ${error.message}`);
      throw new BadRequestException(`Failed to remove payment method`);
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(email: string, name: string, metadata: Record<string, any> = {}): Promise<string> {
    try {
      // Search for existing customer
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      this.logger.log(`Created Stripe customer: ${customer.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create/get customer: ${error.message}`);
      throw new BadRequestException(`Customer management failed`);
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeWebhook(payload: string | Buffer, signature: string): any {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeWebhookSecret,
      );
      return event;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(webhook: PaymentWebhook): Promise<void> {
    this.logger.log(`Processing webhook event: ${webhook.event}`);

    switch (webhook.event) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(webhook.data);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(webhook.data);
        break;
      case 'charge.refunded':
        await this.handleRefund(webhook.data);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(webhook.data);
        break;
      default:
        this.logger.warn(`Unhandled webhook event: ${webhook.event}`);
    }
  }

  private async handlePaymentSuccess(data: any): Promise<void> {
    this.logger.log(`Payment succeeded: ${data.id}`);
    // Implement payment success logic (update invoice status, send receipt, etc.)
  }

  private async handlePaymentFailure(data: any): Promise<void> {
    this.logger.warn(`Payment failed: ${data.id}`);
    // Implement payment failure logic (notify client, retry logic, etc.)
  }

  private async handleRefund(data: any): Promise<void> {
    this.logger.log(`Refund processed: ${data.id}`);
    // Implement refund logic (update invoice, notify client, etc.)
  }

  private async handleSubscriptionCancellation(data: any): Promise<void> {
    this.logger.log(`Subscription cancelled: ${data.id}`);
    // Implement cancellation logic (update subscription status, notify client, etc.)
  }

  /**
   * Calculate processing fees
   */
  calculateProcessingFee(amount: number, gateway: 'stripe' | 'paypal' = 'stripe'): number {
    if (gateway === 'stripe') {
      // Stripe: 2.9% + $0.30
      return (amount * 0.029) + 0.30;
    } else {
      // PayPal: 2.99% + $0.49
      return (amount * 0.0299) + 0.49;
    }
  }

  /**
   * Get net amount after processing fees
   */
  getNetAmount(amount: number, gateway: 'stripe' | 'paypal' = 'stripe'): number {
    const fee = this.calculateProcessingFee(amount, gateway);
    return amount - fee;
  }
}
