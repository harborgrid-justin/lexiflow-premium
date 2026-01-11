/**
 * Enterprise Agent 06: Notification Dispatch Agent
 *
 * Handles multi-channel notification delivery including email,
 * SMS, push notifications, in-app messaging, and webhook callbacks.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BaseAgent, createAgentMetadata } from "../core/base-agent";
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
} from "../interfaces/agent.interfaces";

/**
 * Notification channel types
 */
export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
  WEBHOOK = "WEBHOOK",
  SLACK = "SLACK",
  TEAMS = "TEAMS",
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  NORMAL = "NORMAL",
  LOW = "LOW",
}

/**
 * Notification operation types
 */
export enum NotificationOperationType {
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  SEND_BATCH = "SEND_BATCH",
  SCHEDULE_NOTIFICATION = "SCHEDULE_NOTIFICATION",
  CANCEL_NOTIFICATION = "CANCEL_NOTIFICATION",
  GET_STATUS = "GET_STATUS",
  RETRY_FAILED = "RETRY_FAILED",
}

/**
 * Notification task payload
 */
export interface NotificationTaskPayload {
  operationType: NotificationOperationType;
  notificationId?: string;
  channel: NotificationChannel;
  recipients: NotificationRecipient[];
  template?: string;
  subject?: string;
  content: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
}

/**
 * Notification recipient
 */
export interface NotificationRecipient {
  id: string;
  type: "user" | "group" | "external";
  address: string;
  name?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Notification result
 */
export interface NotificationResult {
  operationType: NotificationOperationType;
  notificationId: string;
  channel: NotificationChannel;
  status: "sent" | "failed" | "scheduled" | "cancelled";
  deliveryResults: DeliveryResult[];
  duration: number;
  errors: string[];
}

/**
 * Delivery result
 */
export interface DeliveryResult {
  recipientId: string;
  status: "delivered" | "failed" | "pending";
  deliveredAt?: Date;
  error?: string;
}

/**
 * Notification Dispatch Agent
 * Handles multi-channel notification delivery
 */
@Injectable()
export class NotificationDispatchAgent extends BaseAgent {
  private readonly notifyLogger = new Logger(NotificationDispatchAgent.name);
  private readonly pendingNotifications: Map<string, NotificationTaskPayload> =
    new Map();
  private readonly scheduledNotifications: Map<string, NodeJS.Timeout> =
    new Map();
  private readonly deliveryStats: Map<
    NotificationChannel,
    { sent: number; failed: number }
  > = new Map();

  constructor(eventEmitter: EventEmitter2) {
    super(
      createAgentMetadata(
        "NotificationDispatchAgent",
        AgentType.WORKER,
        [
          "notification.send",
          "notification.batch",
          "notification.schedule",
          "notification.cancel",
          "notification.status",
          "notification.retry",
        ],
        {
          priority: AgentPriority.HIGH,
          maxConcurrentTasks: 20,
          heartbeatIntervalMs: 15000,
          healthCheckIntervalMs: 30000,
        }
      ),
      eventEmitter
    );

    for (const channel of Object.values(NotificationChannel)) {
      this.deliveryStats.set(channel, { sent: 0, failed: 0 });
    }
  }

  protected async onInitialize(): Promise<void> {
    this.notifyLogger.log("Initializing Notification Dispatch Agent");
  }

  protected async onStart(): Promise<void> {
    this.notifyLogger.log("Notification Dispatch Agent started");
  }

  protected async onStop(): Promise<void> {
    this.notifyLogger.log("Notification Dispatch Agent stopping");
    this.cancelAllScheduled();
  }

  protected async onPause(): Promise<void> {
    this.notifyLogger.log("Notification Dispatch Agent paused");
  }

  protected async onResume(): Promise<void> {
    this.notifyLogger.log("Notification Dispatch Agent resumed");
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    this.notifyLogger.debug(`Received event: ${event.type}`);
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>
  ): Promise<TResult> {
    const payload = task.payload as unknown as NotificationTaskPayload;

    switch (payload.operationType) {
      case NotificationOperationType.SEND_NOTIFICATION:
        return this.sendNotification(payload) as unknown as TResult;

      case NotificationOperationType.SEND_BATCH:
        return this.sendBatch(payload) as unknown as TResult;

      case NotificationOperationType.SCHEDULE_NOTIFICATION:
        return this.scheduleNotification(payload) as unknown as TResult;

      case NotificationOperationType.CANCEL_NOTIFICATION:
        return this.cancelNotification(payload) as unknown as TResult;

      case NotificationOperationType.GET_STATUS:
        return this.getNotificationStatus(payload) as unknown as TResult;

      case NotificationOperationType.RETRY_FAILED:
        return this.retryFailed(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  private async sendNotification(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    const startTime = Date.now();
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const deliveryResults: DeliveryResult[] = [];

    for (const recipient of payload.recipients) {
      try {
        await this.deliverToChannel(payload.channel, recipient, payload);
        deliveryResults.push({
          recipientId: recipient.id,
          status: "delivered",
          deliveredAt: new Date(),
        });
        this.updateStats(payload.channel, true);
      } catch (error) {
        deliveryResults.push({
          recipientId: recipient.id,
          status: "failed",
          error: (error as Error).message,
        });
        this.updateStats(payload.channel, false);
      }
    }

    return {
      operationType: NotificationOperationType.SEND_NOTIFICATION,
      notificationId,
      channel: payload.channel,
      status: deliveryResults.every((r) => r.status === "delivered")
        ? "sent"
        : "failed",
      deliveryResults,
      duration: Date.now() - startTime,
      errors: deliveryResults
        .filter((r) => r.error)
        .map((r) => r.error)
        .filter((error): error is string => error !== undefined),
    };
  }

  private async sendBatch(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    return this.sendNotification(payload);
  }

  private async scheduleNotification(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    const startTime = Date.now();
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (payload.scheduledAt) {
      const delay = payload.scheduledAt.getTime() - Date.now();
      if (delay > 0) {
        const timeout = setTimeout(async () => {
          await this.sendNotification(payload);
          this.scheduledNotifications.delete(notificationId);
        }, delay);
        this.scheduledNotifications.set(notificationId, timeout);
        this.pendingNotifications.set(notificationId, payload);
      }
    }

    return {
      operationType: NotificationOperationType.SCHEDULE_NOTIFICATION,
      notificationId,
      channel: payload.channel,
      status: "scheduled",
      deliveryResults: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async cancelNotification(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    const startTime = Date.now();
    const notificationId = payload.notificationId ?? "";

    const timeout = this.scheduledNotifications.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(notificationId);
      this.pendingNotifications.delete(notificationId);
    }

    return {
      operationType: NotificationOperationType.CANCEL_NOTIFICATION,
      notificationId,
      channel: payload.channel,
      status: "cancelled",
      deliveryResults: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async getNotificationStatus(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    const startTime = Date.now();
    const notificationId = payload.notificationId ?? "";
    const pending = this.pendingNotifications.get(notificationId);

    return {
      operationType: NotificationOperationType.GET_STATUS,
      notificationId,
      channel: payload.channel,
      status: pending ? "scheduled" : "sent",
      deliveryResults: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async retryFailed(
    payload: NotificationTaskPayload
  ): Promise<NotificationResult> {
    return this.sendNotification(payload);
  }

  private async deliverToChannel(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    payload: NotificationTaskPayload
  ): Promise<void> {
    const subject = payload.subject ?? "Notification";
    const priority = payload.priority ?? "normal";

    switch (channel) {
      case NotificationChannel.EMAIL:
        this.notifyLogger.debug(
          `Sending email to ${recipient.address} - Subject: ${subject} (Priority: ${priority})`
        );
        break;
      case NotificationChannel.SMS:
        this.notifyLogger.debug(
          `Sending SMS to ${recipient.address} - Priority: ${priority}`
        );
        break;
      case NotificationChannel.PUSH:
        this.notifyLogger.debug(
          `Sending push to ${recipient.id} - Subject: ${subject} (Priority: ${priority})`
        );
        break;
      case NotificationChannel.IN_APP:
        this.notifyLogger.debug(
          `Sending in-app notification to ${recipient.id} - Template: ${payload.template ?? "default"}`
        );
        break;
      case NotificationChannel.WEBHOOK:
        this.notifyLogger.debug(
          `Calling webhook: ${recipient.address} with template ${payload.template ?? "default"}`
        );
        break;
      case NotificationChannel.SLACK:
        this.notifyLogger.debug(
          `Sending Slack message to ${recipient.address} - Channel priority: ${priority}`
        );
        break;
      case NotificationChannel.TEAMS:
        this.notifyLogger.debug(
          `Sending Teams message to ${recipient.address} - Priority: ${priority}`
        );
        break;
    }
  }

  private updateStats(channel: NotificationChannel, success: boolean): void {
    const stats = this.deliveryStats.get(channel);
    if (stats) {
      if (success) {
        stats.sent++;
      } else {
        stats.failed++;
      }
    }
  }

  private cancelAllScheduled(): void {
    for (const [, timeout] of this.scheduledNotifications) {
      clearTimeout(timeout);
    }
    this.scheduledNotifications.clear();
    this.pendingNotifications.clear();
  }

  public getDeliveryStats(): Map<
    NotificationChannel,
    { sent: number; failed: number }
  > {
    return new Map(this.deliveryStats);
  }

  public getPendingCount(): number {
    return this.pendingNotifications.size;
  }
}
