import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  variables?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransporter({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    this.logger.log(`Email service initialized with SMTP host: ${host}:${port}`);
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const from = options.from || this.configService.get<string>('EMAIL_FROM', 'noreply@lexiflow.com');

      const info = await this.transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<void> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email)),
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    this.logger.log(`Bulk email completed: ${succeeded} succeeded, ${failed} failed`);
  }

  /**
   * Send email from template
   */
  async sendTemplateEmail(template: EmailTemplate, to: string | string[]): Promise<void> {
    let html = template.html;

    // Replace template variables
    if (template.variables) {
      Object.keys(template.variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        html = html.replace(new RegExp(placeholder, 'g'), template.variables[key]);
      });
    }

    await this.sendEmail({
      to,
      subject: template.subject,
      html,
    });
  }

  /**
   * Send case notification email
   */
  async sendCaseNotification(
    to: string | string[],
    caseName: string,
    message: string,
    caseUrl?: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Case Update: ${caseName}</h2>
        <p style="color: #666; line-height: 1.6;">${message}</p>
        ${caseUrl ? `<p><a href="${caseUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Case</a></p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated notification from LexiFlow AI Legal Suite.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: `Case Update: ${caseName}`,
      html,
    });
  }

  /**
   * Send deadline reminder email
   */
  async sendDeadlineReminder(
    to: string | string[],
    caseName: string,
    deadline: Date,
    description: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ Deadline Reminder</h2>
        <p style="color: #666;"><strong>Case:</strong> ${caseName}</p>
        <p style="color: #666;"><strong>Deadline:</strong> ${deadline.toLocaleString()}</p>
        <p style="color: #666;"><strong>Description:</strong> ${description}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated reminder from LexiFlow AI Legal Suite.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: `⚠️ Deadline Reminder: ${caseName}`,
      html,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoice(
    to: string | string[],
    invoiceNumber: string,
    amount: string,
    dueDate: Date,
    pdfAttachment?: Buffer,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Invoice ${invoiceNumber}</h2>
        <p style="color: #666;"><strong>Amount Due:</strong> ${amount}</p>
        <p style="color: #666;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
        <p style="color: #666; margin-top: 20px;">Please find the invoice attached to this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Thank you for your business.</p>
      </div>
    `;

    const attachments = pdfAttachment
      ? [{
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf',
        }]
      : undefined;

    await this.sendEmail({
      to,
      subject: `Invoice ${invoiceNumber} - ${amount}`,
      html,
      attachments,
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, userName: string, loginUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to LexiFlow AI Legal Suite!</h2>
        <p style="color: #666;">Hi ${userName},</p>
        <p style="color: #666; line-height: 1.6;">
          Thank you for joining LexiFlow. We're excited to help you streamline your legal practice with AI-powered tools.
        </p>
        <p><a href="${loginUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you have any questions, please don't hesitate to contact our support team.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: 'Welcome to LexiFlow AI Legal Suite',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, resetToken: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666;">You requested to reset your password. Click the button below to proceed:</p>
        <p><a href="${resetUrl}?token=${resetToken}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p style="color: #666; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request - LexiFlow',
      html,
    });
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed', error.stack);
      return false;
    }
  }
}
