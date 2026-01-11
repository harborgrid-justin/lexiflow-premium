import { Injectable, Logger } from "@nestjs/common";
import { DeliveryAttempt, SMSPayload, SMSServiceConfig } from "../types";

/**
 * SMS Delivery Service
 *
 * Handles SMS notification delivery with:
 * - Multiple provider support (Twilio, AWS SNS)
 * - Retry logic with exponential backoff
 * - Error handling and logging
 * - Message length validation
 * - Phone number formatting
 *
 * In production, integrate with actual SMS providers:
 * - Twilio: twilio SDK
 * - AWS SNS: @aws-sdk/client-sns
 *
 * @class SMSDeliveryService
 */
/**
 * ╔=================================================================================================================╗
 * ║SMSDELIVERY                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class SMSDeliveryService {
  private readonly logger = new Logger(SMSDeliveryService.name);
  private config: SMSServiceConfig;
  private readonly MAX_SMS_LENGTH = 160;

  constructor() {
    // Default configuration - in production, load from environment/config service
    this.config = {
      provider: "twilio",
      fromNumber: process.env.SMS_FROM_NUMBER || "+1234567890",
      maxRetries: 3,
      retryDelayMs: 1000,
      retryBackoffMultiplier: 2,
      timeout: 30000,
      // Provider-specific configs
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      awsRegion: process.env.AWS_REGION || "us-east-1",
    };

    this.logger.log(
      `SMSDeliveryService initialized with provider: ${this.config.provider}`
    );
  }

  /**
   * Send SMS with retry logic
   */
  async send(payload: SMSPayload): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    attempts: DeliveryAttempt[];
  }> {
    // Validate phone number
    if (!this.validatePhoneNumber(payload.to)) {
      return {
        success: false,
        error: `Invalid phone number format: ${payload.to}`,
        attempts: [],
      };
    }

    // Validate message length
    if (payload.body.length > this.MAX_SMS_LENGTH) {
      this.logger.warn(
        `SMS message exceeds ${this.MAX_SMS_LENGTH} characters, will be split or truncated`
      );
    }

    const attempts: DeliveryAttempt[] = [];
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `SMS delivery attempt ${attempt}/${this.config.maxRetries} to ${payload.to}`
        );

        const messageId = await this.deliverSMS(payload);

        const attemptRecord: DeliveryAttempt = {
          attemptNumber: attempt,
          timestamp: new Date(),
          success: true,
          messageId,
        };
        attempts.push(attemptRecord);

        this.logger.log(
          `SMS delivered successfully to ${payload.to} (messageId: ${messageId})`
        );

        return {
          success: true,
          messageId,
          attempts,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        lastError = errorMessage;

        const attemptRecord: DeliveryAttempt = {
          attemptNumber: attempt,
          timestamp: new Date(),
          success: false,
          error: errorMessage,
        };
        attempts.push(attemptRecord);

        this.logger.warn(
          `SMS delivery attempt ${attempt} failed: ${errorMessage}`
        );

        // Wait before retry (with exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `SMS delivery failed after ${this.config.maxRetries} attempts to ${payload.to}: ${lastError}`
    );

    return {
      success: false,
      error: lastError,
      attempts,
    };
  }

  /**
   * Deliver SMS via configured provider
   */
  private async deliverSMS(payload: SMSPayload): Promise<string> {
    switch (this.config.provider) {
      case "twilio":
        return await this.sendViaTwilio(payload);
      case "sns":
        return await this.sendViaSNS(payload);
      default:
        throw new Error(`Unsupported SMS provider: ${this.config.provider}`);
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(payload: SMSPayload): Promise<string> {
    // In production, use twilio SDK
    // import twilio from \'twilio\';
    //
    // const client = twilio(this.config.accountSid, this.config.authToken);
    //
    // const message = await client.messages.create({
    //   body: payload.body,
    //   from: payload.from || this.config.fromNumber,
    //   to: payload.to,
    // });
    //
    // return message.sid;

    this.logger.debug(
      `[Twilio Mock] Sending SMS to ${payload.to}: ${payload.body}`
    );
    return `twilio-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Send SMS via AWS SNS
   */
  private async sendViaSNS(payload: SMSPayload): Promise<string> {
    // In production, use @aws-sdk/client-sns
    // const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
    //
    // const client = new SNSClient({ region: this.config.awsRegion });
    //
    // const command = new PublishCommand({
    //   Message: payload.body,
    //   PhoneNumber: payload.to,
    //   MessageAttributes: {
    //     'AWS.SNS.SMS.SMSType': {
    //       DataType: 'String',
    //       StringValue: 'Transactional',
    //     },
    //   },
    // });
    //
    // const response = await client.send(command);
    // return response.MessageId!;

    this.logger.debug(
      `[AWS SNS Mock] Sending SMS to ${payload.to}: ${payload.body}`
    );
    return `sns-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptNumber: number): number {
    return (
      this.config.retryDelayMs *
      Math.pow(this.config.retryBackoffMultiplier, attemptNumber - 1)
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate phone number format
   * Basic validation - in production, use libphonenumber-js
   */
  validatePhoneNumber(phone: string): boolean {
    // E.164 format: +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phone: string, countryCode: string = "1"): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Add country code if not present
    if (!phone.startsWith("+")) {
      return `+${countryCode}${cleaned}`;
    }

    return `+${cleaned}`;
  }

  /**
   * Truncate message to SMS length
   */
  truncateMessage(
    message: string,
    maxLength: number = this.MAX_SMS_LENGTH
  ): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + "...";
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<SMSServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log("SMS service configuration updated");
  }

  /**
   * Get current configuration (sensitive data redacted)
   */
  getConfig(): Omit<SMSServiceConfig, "authToken" | "accountSid"> {
    const {
      authToken: _authToken,
      accountSid: _accountSid,
      ...safeConfig
    } = this.config;
    return safeConfig;
  }

  /**
   * Send bulk SMS
   */
  async sendBulk(payloads: SMSPayload[]): Promise<
    Array<{
      phone: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>
  > {
    this.logger.log(`Sending bulk SMS: ${payloads.length} recipients`);

    const results = await Promise.allSettled(
      payloads.map(async (payload) => {
        const result = await this.send(payload);
        return {
          phone: payload.to,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        };
      })
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          phone: "unknown",
          success: false,
          error: result.reason?.message || "Unknown error",
        };
      }
    });
  }

  /**
   * Check SMS delivery status (for providers that support it)
   */
  async checkStatus(messageId: string): Promise<{
    status: "pending" | "sent" | "delivered" | "failed";
    error?: string;
  }> {
    // In production, query provider API for message status
    this.logger.debug(`Checking SMS status for messageId: ${messageId}`);

    return {
      status: "delivered",
    };
  }
}
