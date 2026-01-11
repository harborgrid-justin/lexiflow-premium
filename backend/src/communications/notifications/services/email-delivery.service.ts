import { Injectable, Logger } from "@nestjs/common";
import { DeliveryAttempt, EmailPayload, EmailServiceConfig } from "../types";

/**
 * Email Delivery Service
 *
 * Handles email notification delivery with:
 * - Multiple provider support (SendGrid, AWS SES, SMTP)
 * - Retry logic with exponential backoff
 * - Error handling and logging
 * - Template support (HTML/plain text)
 * - Attachment support
 *
 * In production, integrate with actual email providers:
 * - SendGrid: @sendgrid/mail
 * - AWS SES: aws-sdk or @aws-sdk/client-ses
 * - SMTP: nodemailer
 *
 * @class EmailDeliveryService
 */
/**
 * ╔=================================================================================================================╗
 * ║EMAILDELIVERY                                                                                                    ║
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
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);
  private config: EmailServiceConfig;

  constructor() {
    // Default configuration - in production, load from environment/config service
    this.config = {
      provider: "smtp",
      fromAddress:
        process.env.EMAIL_FROM_ADDRESS || "notifications@lexiflow.com",
      fromName: process.env.EMAIL_FROM_NAME || "LexiFlow",
      maxRetries: 3,
      retryDelayMs: 1000,
      retryBackoffMultiplier: 2,
      timeout: 30000,
      // Provider-specific configs
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
      apiKey: process.env.SENDGRID_API_KEY || process.env.AWS_SES_API_KEY,
    };

    this.logger.log(
      `EmailDeliveryService initialized with provider: ${this.config.provider}`
    );
  }

  /**
   * Send email with retry logic
   */
  async send(payload: EmailPayload): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    attempts: DeliveryAttempt[];
  }> {
    const attempts: DeliveryAttempt[] = [];
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Email delivery attempt ${attempt}/${this.config.maxRetries} to ${payload.to}`
        );

        const messageId = await this.deliverEmail(payload);

        const attemptRecord: DeliveryAttempt = {
          attemptNumber: attempt,
          timestamp: new Date(),
          success: true,
          messageId,
        };
        attempts.push(attemptRecord);

        this.logger.log(
          `Email delivered successfully to ${payload.to} (messageId: ${messageId})`
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
          `Email delivery attempt ${attempt} failed: ${errorMessage}`
        );

        // Wait before retry (with exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `Email delivery failed after ${this.config.maxRetries} attempts to ${payload.to}: ${lastError}`
    );

    return {
      success: false,
      error: lastError,
      attempts,
    };
  }

  /**
   * Deliver email via configured provider
   */
  private async deliverEmail(payload: EmailPayload): Promise<string> {
    switch (this.config.provider) {
      case "sendgrid":
        return await this.sendViaSendGrid(payload);
      case "ses":
        return await this.sendViaSES(payload);
      case "smtp":
        return await this.sendViaSMTP(payload);
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<string> {
    // In production, use @sendgrid/mail
    // import sgMail from \'@sendgrid/mail\';
    // sgMail.setApiKey(this.config.apiKey);
    //
    // const msg = {
    //   to: payload.to,
    //   from: payload.from || this.config.fromAddress,
    //   subject: payload.subject,
    //   text: payload.body,
    //   html: payload.html,
    // };
    //
    // const [response] = await sgMail.send(msg);
    // return response.headers['x-message-id'];

    this.logger.debug(
      `[SendGrid Mock] Sending email to ${payload.to}: ${payload.subject}`
    );
    return `sendgrid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Send email via AWS SES
   */
  private async sendViaSES(payload: EmailPayload): Promise<string> {
    // In production, use @aws-sdk/client-ses
    // const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    //
    // const client = new SESClient({ region: 'us-east-1' });
    // const command = new SendEmailCommand({
    //   Source: payload.from || this.config.fromAddress,
    //   Destination: {
    //     ToAddresses: [payload.to],
    //   },
    //   Message: {
    //     Subject: { Data: payload.subject },
    //     Body: {
    //       Text: { Data: payload.body },
    //       Html: { Data: payload.html || payload.body },
    //     },
    //   },
    // });
    //
    // const response = await client.send(command);
    // return response.MessageId!;

    this.logger.debug(
      `[AWS SES Mock] Sending email to ${payload.to}: ${payload.subject}`
    );
    return `ses-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Send email via SMTP
   */
  private async sendViaSMTP(payload: EmailPayload): Promise<string> {
    // In production, use nodemailer
    // import nodemailer from \'nodemailer\';
    //
    // const transporter = nodemailer.createTransport({
    //   host: this.config.smtpHost,
    //   port: this.config.smtpPort,
    //   secure: this.config.smtpPort === 465,
    //   auth: {
    //     user: this.config.smtpUser,
    //     pass: this.config.smtpPassword,
    //   },
    // });
    //
    // const info = await transporter.sendMail({
    //   from: payload.from || `"${this.config.fromName}" <${this.config.fromAddress}>`,
    //   to: payload.to,
    //   subject: payload.subject,
    //   text: payload.body,
    //   html: payload.html,
    //   attachments: payload.attachments,
    // });
    //
    // return info.messageId;

    this.logger.debug(
      `[SMTP Mock] Sending email to ${payload.to}: ${payload.subject}`
    );
    return `smtp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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
   * Update service configuration
   */
  updateConfig(config: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log("Email service configuration updated");
  }

  /**
   * Get current configuration (sensitive data redacted)
   */
  getConfig(): Omit<EmailServiceConfig, "apiKey" | "smtpPassword"> {
    const {
      apiKey: _apiKey,
      smtpPassword: _smtpPassword,
      ...safeConfig
    } = this.config;
    return safeConfig;
  }

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Send bulk emails
   */
  async sendBulk(payloads: EmailPayload[]): Promise<
    Array<{
      email: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>
  > {
    this.logger.log(`Sending bulk emails: ${payloads.length} recipients`);

    const results = await Promise.allSettled(
      payloads.map(async (payload) => {
        const result = await this.send(payload);
        return {
          email: payload.to,
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
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        return {
          email: "unknown",
          success: false,
          error: errorMessage,
        };
      }
    });
  }
}
