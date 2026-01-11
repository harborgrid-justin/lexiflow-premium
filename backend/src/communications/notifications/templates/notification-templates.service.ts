import { Injectable, Logger } from "@nestjs/common";
import { NotificationType } from "../dto/create-notification.dto";
import {
  NotificationTemplate,
  RenderedNotification,
  TemplateChannel,
  TemplateContext,
  TemplateVariable,
} from "./notification-template.interface";

/**
 * Notification Templates Service
 *
 * Manages notification templates and renders them with dynamic data.
 * Supports multiple channels (in-app, email, push, SMS, Slack) and
 * provides a centralized template registry.
 *
 * Features:
 * - Pre-defined templates for common notification types
 * - Variable substitution with type safety
 * - Channel-specific formatting
 * - Template caching for performance
 * - Extensible template system
 *
 * @class NotificationTemplatesService
 */
/**
 * ╔=================================================================================================================╗
 * ║NOTIFICATIONTEMPLATES                                                                                            ║
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
export class NotificationTemplatesService {
  private readonly logger = new Logger(NotificationTemplatesService.name);
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.logger.log(
      "NotificationTemplatesService initialized with default templates"
    );
  }

  /**
   * Initialize default templates for common notification types
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      // Case Update Templates
      {
        id: "case_update_in_app",
        type: NotificationType.CASE_UPDATE,
        channel: TemplateChannel.IN_APP,
        title: "Case {{caseNumber}} Updated",
        body: "{{entityName}} has been updated. Click to view details.",
        priority: "medium",
        icon: "FileText",
        color: "#3b82f6",
        actionLabel: "View Case",
        actionUrlTemplate: "/cases/{{caseNumber}}",
        variables: [TemplateVariable.CASE_NUMBER, TemplateVariable.ENTITY_NAME],
      },
      {
        id: "case_update_email",
        type: NotificationType.CASE_UPDATE,
        channel: TemplateChannel.EMAIL,
        subject: "Case {{caseNumber}} - Status Update",
        title: "Case Update Notification",
        body: "Hello {{userName}},\n\nCase {{caseNumber}} has been updated.\n\nUpdate: {{entityName}}\n\nClick here to view the case details: {{actionUrl}}",
        priority: "medium",
        actionUrlTemplate: "/cases/{{caseNumber}}",
        variables: [
          TemplateVariable.USER_NAME,
          TemplateVariable.CASE_NUMBER,
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.ACTION_URL,
        ],
      },

      // Document Upload Templates
      {
        id: "document_upload_in_app",
        type: NotificationType.DOCUMENT_UPLOADED,
        channel: TemplateChannel.IN_APP,
        title: "New Document: {{documentName}}",
        body: "{{senderName}} uploaded a new document to case {{caseNumber}}.",
        priority: "medium",
        icon: "Upload",
        color: "#10b981",
        actionLabel: "View Document",
        actionUrlTemplate: "/documents/{{documentName}}",
        variables: [
          TemplateVariable.DOCUMENT_NAME,
          TemplateVariable.SENDER_NAME,
          TemplateVariable.CASE_NUMBER,
        ],
      },
      {
        id: "document_upload_push",
        type: NotificationType.DOCUMENT_UPLOADED,
        channel: TemplateChannel.PUSH,
        title: "New Document",
        body: "{{documentName}} uploaded by {{senderName}}",
        priority: "medium",
        icon: "Upload",
        variables: [
          TemplateVariable.DOCUMENT_NAME,
          TemplateVariable.SENDER_NAME,
        ],
      },

      // Deadline Reminder Templates
      {
        id: "deadline_reminder_in_app",
        type: NotificationType.DEADLINE_REMINDER,
        channel: TemplateChannel.IN_APP,
        title: "Deadline Approaching",
        body: "{{entityName}} is due on {{deadlineDate}}. Don't forget to take action.",
        priority: "high",
        icon: "AlertCircle",
        color: "#f59e0b",
        actionLabel: "View Details",
        actionUrlTemplate: "/deadlines",
        variables: [
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.DEADLINE_DATE,
        ],
      },
      {
        id: "deadline_reminder_email",
        type: NotificationType.DEADLINE_REMINDER,
        channel: TemplateChannel.EMAIL,
        subject: "Reminder: {{entityName}} due {{deadlineDate}}",
        title: "Deadline Reminder",
        body: "Hello {{userName}},\n\nThis is a reminder that {{entityName}} is due on {{deadlineDate}}.\n\nPlease ensure all required actions are completed before the deadline.\n\nView details: {{actionUrl}}",
        priority: "high",
        variables: [
          TemplateVariable.USER_NAME,
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.DEADLINE_DATE,
          TemplateVariable.ACTION_URL,
        ],
      },
      {
        id: "deadline_reminder_sms",
        type: NotificationType.DEADLINE_REMINDER,
        channel: TemplateChannel.SMS,
        title: "Deadline",
        body: "Reminder: {{entityName}} due {{deadlineDate}}",
        priority: "high",
        variables: [
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.DEADLINE_DATE,
        ],
      },

      // Task Assignment Templates
      {
        id: "task_assigned_in_app",
        type: NotificationType.TASK_ASSIGNED,
        channel: TemplateChannel.IN_APP,
        title: "New Task Assigned",
        body: "{{senderName}} assigned you: {{taskTitle}}",
        priority: "medium",
        icon: "CheckSquare",
        color: "#8b5cf6",
        actionLabel: "View Task",
        actionUrlTemplate: "/tasks/{{taskTitle}}",
        variables: [TemplateVariable.SENDER_NAME, TemplateVariable.TASK_TITLE],
      },
      {
        id: "task_assigned_email",
        type: NotificationType.TASK_ASSIGNED,
        channel: TemplateChannel.EMAIL,
        subject: "Task Assigned: {{taskTitle}}",
        title: "New Task Assignment",
        body: "Hello {{userName}},\n\n{{senderName}} has assigned you a new task:\n\nTask: {{taskTitle}}\n\nPlease review and complete by the due date.\n\nView task: {{actionUrl}}",
        priority: "medium",
        variables: [
          TemplateVariable.USER_NAME,
          TemplateVariable.SENDER_NAME,
          TemplateVariable.TASK_TITLE,
          TemplateVariable.ACTION_URL,
        ],
      },

      // Message Received Templates
      {
        id: "message_received_in_app",
        type: NotificationType.MESSAGE_RECEIVED,
        channel: TemplateChannel.IN_APP,
        title: "Message from {{senderName}}",
        body: "You have a new message",
        priority: "medium",
        icon: "MessageCircle",
        color: "#3b82f6",
        actionLabel: "Read Message",
        actionUrlTemplate: "/messages",
        variables: [TemplateVariable.SENDER_NAME],
      },
      {
        id: "message_received_push",
        type: NotificationType.MESSAGE_RECEIVED,
        channel: TemplateChannel.PUSH,
        title: "{{senderName}}",
        body: "Sent you a message",
        priority: "medium",
        variables: [TemplateVariable.SENDER_NAME],
      },

      // Invoice Templates
      {
        id: "invoice_sent_in_app",
        type: NotificationType.INVOICE_SENT,
        channel: TemplateChannel.IN_APP,
        title: "Invoice {{entityName}}",
        body: "A new invoice for {{amount}} has been sent.",
        priority: "medium",
        icon: "DollarSign",
        color: "#10b981",
        actionLabel: "View Invoice",
        actionUrlTemplate: "/invoices/{{entityName}}",
        variables: [TemplateVariable.ENTITY_NAME, TemplateVariable.AMOUNT],
      },
      {
        id: "invoice_sent_email",
        type: NotificationType.INVOICE_SENT,
        channel: TemplateChannel.EMAIL,
        subject: "Invoice {{entityName}} - Amount: {{amount}}",
        title: "New Invoice",
        body: "Hello {{userName}},\n\nYou have received a new invoice.\n\nInvoice: {{entityName}}\nAmount: {{amount}}\n\nView invoice: {{actionUrl}}",
        priority: "medium",
        variables: [
          TemplateVariable.USER_NAME,
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.AMOUNT,
          TemplateVariable.ACTION_URL,
        ],
      },

      // Approval Required Templates
      {
        id: "approval_required_in_app",
        type: NotificationType.APPROVAL_REQUIRED,
        channel: TemplateChannel.IN_APP,
        title: "Approval Required",
        body: "{{entityName}} requires your approval",
        priority: "high",
        icon: "AlertTriangle",
        color: "#f59e0b",
        actionLabel: "Review",
        actionUrlTemplate: "/approvals",
        variables: [TemplateVariable.ENTITY_NAME],
      },
      {
        id: "approval_required_email",
        type: NotificationType.APPROVAL_REQUIRED,
        channel: TemplateChannel.EMAIL,
        subject: "Action Required: Approval Needed",
        title: "Approval Request",
        body: "Hello {{userName}},\n\n{{entityName}} requires your approval.\n\nPlease review and approve/reject at your earliest convenience.\n\nReview: {{actionUrl}}",
        priority: "high",
        variables: [
          TemplateVariable.USER_NAME,
          TemplateVariable.ENTITY_NAME,
          TemplateVariable.ACTION_URL,
        ],
      },

      // System Alert Templates
      {
        id: "system_alert_in_app",
        type: NotificationType.SYSTEM_ALERT,
        channel: TemplateChannel.IN_APP,
        title: "System Alert",
        body: "{{entityName}}",
        priority: "urgent",
        icon: "AlertOctagon",
        color: "#ef4444",
        actionLabel: "Learn More",
        variables: [TemplateVariable.ENTITY_NAME],
      },
      {
        id: "system_alert_push",
        type: NotificationType.SYSTEM_ALERT,
        channel: TemplateChannel.PUSH,
        title: "System Alert",
        body: "{{entityName}}",
        priority: "urgent",
        variables: [TemplateVariable.ENTITY_NAME],
      },
    ];

    // Register all default templates
    defaultTemplates.forEach((template) => {
      const key = this.getTemplateKey(template.type, template.channel);
      this.templates.set(key, template);
    });

    this.logger.log(`Registered ${defaultTemplates.length} default templates`);
  }

  /**
   * Get template key for map lookup
   */
  private getTemplateKey(type: string, channel: TemplateChannel): string {
    return `${type}_${channel}`;
  }

  /**
   * Get template by type and channel
   */
  getTemplate(
    type: string,
    channel: TemplateChannel
  ): NotificationTemplate | null {
    const key = this.getTemplateKey(type, channel);
    const template = this.templates.get(key);

    if (!template) {
      this.logger.warn(`Template not found: ${key}`);
      return null;
    }

    return template;
  }

  /**
   * Register custom template
   */
  registerTemplate(template: NotificationTemplate): void {
    const key = this.getTemplateKey(template.type, template.channel);
    this.templates.set(key, template);
    this.logger.log(`Registered custom template: ${key}`);
  }

  /**
   * Render template with context data
   */
  render(
    type: string,
    channel: TemplateChannel,
    context: TemplateContext
  ): RenderedNotification | null {
    const template = this.getTemplate(type, channel);
    if (!template) {
      this.logger.error(
        `Cannot render: template not found for ${type}/${channel}`
      );
      return null;
    }

    try {
      // Replace variables in title
      let renderedTitle = template.title;
      template.variables.forEach((variable) => {
        const contextKey = this.variableToContextKey(variable);
        const value = context[contextKey] || "";
        renderedTitle = renderedTitle.replace(new RegExp(variable, "g"), value);
      });

      // Replace variables in body
      let renderedBody = template.body;
      template.variables.forEach((variable) => {
        const contextKey = this.variableToContextKey(variable);
        const value = context[contextKey] || "";
        renderedBody = renderedBody.replace(new RegExp(variable, "g"), value);
      });

      // Replace variables in subject (if exists)
      let renderedSubject: string | undefined;
      if (template.subject) {
        renderedSubject = template.subject;
        template.variables.forEach((variable) => {
          const contextKey = this.variableToContextKey(variable);
          const value = context[contextKey] || "";
          if (renderedSubject) {
            renderedSubject = renderedSubject.replace(
              new RegExp(variable, "g"),
              value
            );
          }
        });
      }

      // Replace variables in action URL template
      let renderedActionUrl: string | undefined;
      if (template.actionUrlTemplate) {
        renderedActionUrl = template.actionUrlTemplate;
        template.variables.forEach((variable) => {
          const contextKey = this.variableToContextKey(variable);
          const value = context[contextKey] || "";
          if (renderedActionUrl) {
            renderedActionUrl = renderedActionUrl.replace(
              new RegExp(variable, "g"),
              value
            );
          }
        });
      }

      const rendered: RenderedNotification = {
        title: renderedTitle,
        body: renderedBody,
        subject: renderedSubject,
        actionUrl: renderedActionUrl || context.actionUrl,
        metadata: {
          priority: template.priority,
          icon: template.icon,
          color: template.color,
          actionLabel: template.actionLabel,
          ...template.metadata,
        },
      };

      this.logger.debug(`Rendered template: ${type}/${channel}`);
      return rendered;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Error rendering template ${type}/${channel}: ${message}`
      );
      return null;
    }
  }

  /**
   * Convert template variable to context key
   */
  private variableToContextKey(variable: TemplateVariable): string {
    // Remove {{ and }} and convert to camelCase
    return variable.replace(/[{}]/g, "");
  }

  /**
   * Get all templates for a specific type
   */
  getTemplatesByType(type: string): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type
    );
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check if template exists
   */
  hasTemplate(type: string, channel: TemplateChannel): boolean {
    const key = this.getTemplateKey(type, channel);
    return this.templates.has(key);
  }

  /**
   * Unregister template
   */
  unregisterTemplate(type: string, channel: TemplateChannel): boolean {
    const key = this.getTemplateKey(type, channel);
    const deleted = this.templates.delete(key);
    if (deleted) {
      this.logger.log(`Unregistered template: ${key}`);
    }
    return deleted;
  }
}
