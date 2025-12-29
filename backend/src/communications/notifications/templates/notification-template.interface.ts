/**
 * Notification Template System
 *
 * Provides a flexible template engine for generating consistent
 * notification content across different types and channels.
 *
 * @module NotificationTemplates
 */

export enum TemplateChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  SLACK = 'slack',
}

export enum TemplateVariable {
  USER_NAME = '{{userName}}',
  CASE_NUMBER = '{{caseNumber}}',
  DOCUMENT_NAME = '{{documentName}}',
  DEADLINE_DATE = '{{deadlineDate}}',
  TASK_TITLE = '{{taskTitle}}',
  SENDER_NAME = '{{senderName}}',
  AMOUNT = '{{amount}}',
  ACTION_URL = '{{actionUrl}}',
  ENTITY_NAME = '{{entityName}}',
  TIMESTAMP = '{{timestamp}}',
}

/**
 * Notification template definition
 */
export interface NotificationTemplate {
  id: string;
  type: string;
  channel: TemplateChannel;
  title: string;
  body: string;
  subject?: string; // For email
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon?: string;
  color?: string;
  actionLabel?: string;
  actionUrlTemplate?: string;
  variables: TemplateVariable[];
  metadata?: Record<string, unknown>;
}

/**
 * Template rendering context
 */
export interface TemplateContext {
  userName?: string;
  caseNumber?: string;
  documentName?: string;
  deadlineDate?: string;
  taskTitle?: string;
  senderName?: string;
  amount?: string;
  actionUrl?: string;
  entityName?: string;
  timestamp?: string;
  [key: string]: string | undefined;
}

/**
 * Rendered notification content
 */
export interface RenderedNotification {
  title: string;
  body: string;
  subject?: string;
  actionUrl?: string;
  metadata: Record<string, unknown>;
}
