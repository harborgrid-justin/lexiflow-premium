import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: unknown;
    path?: string;
  }>;
}

/**
 * ╔=================================================================================================================╗
 * ║EMAIL                                                                                                            ║
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
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const emailEnabled = this.configService.get("EMAIL_ENABLED", "false");

    if (emailEnabled === "true") {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get("SMTP_HOST"),
        port: this.configService.get("SMTP_PORT", 587),
        secure: this.configService.get("SMTP_SECURE", false),
        auth: {
          user: this.configService.get("SMTP_USER"),
          pass: this.configService.get("SMTP_PASS"),
        },
      });

      this.logger.log("Email service initialized");
    } else {
      this.logger.warn("Email service is disabled");
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn("Email not sent - service is disabled");
      return;
    }

    try {
      const from =
        options.from ||
        this.configService.get("SMTP_FROM", "noreply@lexiflow.com");

      const mailOptions = {
        from,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(", ")
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(", ")
            : options.bcc
          : undefined,
        attachments: options.attachments as unknown[],
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to: ${mailOptions.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send email: ${message}`, stack);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: "Welcome to LexiFlow",
      html: `
        <h1>Welcome to LexiFlow, ${userName}!</h1>
        <p>Your account has been successfully created.</p>
        <p>You can now log in and start managing your legal cases.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async sendInvoiceEmail(
    to: string,
    invoiceId: string,
    amount: number
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Invoice ${invoiceId}`,
      html: `
        <h1>Invoice ${invoiceId}</h1>
        <p>Amount: $${amount.toFixed(2)}</p>
        <p>Please review the attached invoice.</p>
      `,
    });
  }

  async sendTaskAssignmentEmail(
    to: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Task Assigned: ${taskTitle}`,
      html: `
        <h1>New Task Assignment</h1>
        <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
        <p>Due date: ${dueDate.toLocaleDateString()}</p>
        <p>Please log in to view details.</p>
      `,
    });
  }
}
