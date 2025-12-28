/**
 * Enterprise Agent System - Event Bus
 *
 * Implements event-driven communication between agents using the
 * publish-subscribe pattern. Provides reliable message delivery
 * with retry logic and dead-letter queue support.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import {
  AgentEvent,
  AgentEventType,
  AgentPriority,
} from '../interfaces/agent.interfaces';

/**
 * Event subscription interface
 */
interface EventSubscription {
  id: string;
  eventType: AgentEventType | '*';
  agentId: string;
  callback: (event: AgentEvent) => Promise<void>;
  createdAt: Date;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  totalEventsPublished: number;
  totalEventsDelivered: number;
  totalEventsFailed: number;
  activeSubscriptions: number;
  queueDepth: number;
  averageDeliveryTimeMs: number;
  deadLetterQueueSize: number;
}

/**
 * Dead letter entry
 */
interface DeadLetterEntry {
  event: AgentEvent;
  error: string;
  attempts: number;
  lastAttempt: Date;
}

/**
 * Enterprise Agent Event Bus
 * Central hub for agent-to-agent communication
 */
@Injectable()
export class AgentEventBus implements OnModuleDestroy {
  private readonly logger = new Logger(AgentEventBus.name);
  private readonly subscriptions: Map<string, EventSubscription> = new Map();
  private readonly eventQueue: AgentEvent[] = [];
  private readonly deadLetterQueue: DeadLetterEntry[] = [];
  private readonly deliveryTimes: number[] = [];

  private totalEventsPublished = 0;
  private totalEventsDelivered = 0;
  private totalEventsFailed = 0;

  private processingInterval?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.startProcessing();
    this.logger.log('Agent Event Bus initialized');
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    this.stopProcessing();
    this.subscriptions.clear();
    this.eventQueue.length = 0;
  }

  /**
   * Publish an event to the bus
   */
  async publish<T>(
    type: AgentEventType,
    sourceAgentId: string,
    payload: T,
    options: {
      targetAgentId?: string;
      priority?: AgentPriority;
      correlationId?: string;
    } = {},
  ): Promise<string> {
    const event: AgentEvent<T> = {
      id: uuidv4(),
      type,
      sourceAgentId,
      targetAgentId: options.targetAgentId,
      timestamp: new Date(),
      payload,
      correlationId: options.correlationId,
      priority: options.priority ?? AgentPriority.NORMAL,
    };

    this.enqueueEvent(event);
    this.totalEventsPublished++;

    this.logger.debug(`Event published: ${type} from ${sourceAgentId}`);

    return event.id;
  }

  /**
   * Subscribe to events
   */
  subscribe(
    agentId: string,
    eventType: AgentEventType | '*',
    callback: (event: AgentEvent) => Promise<void>,
  ): string {
    const subscription: EventSubscription = {
      id: uuidv4(),
      eventType,
      agentId,
      callback,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);
    this.logger.debug(`Subscription added: ${agentId} -> ${eventType}`);

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const result = this.subscriptions.delete(subscriptionId);
    if (result) {
      this.logger.debug(`Subscription removed: ${subscriptionId}`);
    }
    return result;
  }

  /**
   * Unsubscribe all subscriptions for an agent
   */
  unsubscribeAll(agentId: string): number {
    let count = 0;
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.agentId === agentId) {
        this.subscriptions.delete(id);
        count++;
      }
    }
    this.logger.debug(`Removed ${count} subscriptions for agent: ${agentId}`);
    return count;
  }

  /**
   * Get event bus statistics
   */
  getStats(): EventBusStats {
    const avgDeliveryTime = this.deliveryTimes.length > 0
      ? this.deliveryTimes.reduce((a, b) => a + b, 0) / this.deliveryTimes.length
      : 0;

    return {
      totalEventsPublished: this.totalEventsPublished,
      totalEventsDelivered: this.totalEventsDelivered,
      totalEventsFailed: this.totalEventsFailed,
      activeSubscriptions: this.subscriptions.size,
      queueDepth: this.eventQueue.length,
      averageDeliveryTimeMs: avgDeliveryTime,
      deadLetterQueueSize: this.deadLetterQueue.length,
    };
  }

  /**
   * Get dead letter queue entries
   */
  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry dead letter entries
   */
  async retryDeadLetters(): Promise<number> {
    let retried = 0;
    const toRetry = [...this.deadLetterQueue];
    this.deadLetterQueue.length = 0;

    for (const entry of toRetry) {
      this.enqueueEvent(entry.event);
      retried++;
    }

    this.logger.log(`Retried ${retried} dead letter entries`);
    return retried;
  }

  /**
   * Enqueue event with priority ordering
   */
  private enqueueEvent(event: AgentEvent): void {
    const insertIndex = this.eventQueue.findIndex(
      e => e.priority > event.priority,
    );

    if (insertIndex === -1) {
      this.eventQueue.push(event);
    } else {
      this.eventQueue.splice(insertIndex, 0, event);
    }
  }

  /**
   * Start event processing loop
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(
      () => this.processEvents(),
      10, // Process events every 10ms
    );
  }

  /**
   * Stop event processing loop
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
  }

  /**
   * Process queued events
   */
  private async processEvents(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batchSize = Math.min(10, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);

      await Promise.all(batch.map(event => this.deliverEvent(event)));
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Deliver event to subscribers
   */
  private async deliverEvent(event: AgentEvent): Promise<void> {
    const startTime = Date.now();
    const matchingSubscriptions = this.getMatchingSubscriptions(event);

    if (matchingSubscriptions.length === 0) {
      this.logger.debug(`No subscribers for event: ${event.type}`);
      return;
    }

    const deliveryPromises = matchingSubscriptions.map(async subscription => {
      try {
        await subscription.callback(event);
        this.totalEventsDelivered++;
      } catch (error) {
        this.totalEventsFailed++;
        this.logger.error(
          `Event delivery failed: ${event.type} -> ${subscription.agentId}`,
          (error as Error).stack,
        );

        this.addToDeadLetterQueue(event, (error as Error).message);
      }
    });

    await Promise.all(deliveryPromises);

    const deliveryTime = Date.now() - startTime;
    this.deliveryTimes.push(deliveryTime);

    if (this.deliveryTimes.length > 1000) {
      this.deliveryTimes.shift();
    }

    this.eventEmitter.emit(event.type, event);
  }

  /**
   * Get subscriptions matching an event
   */
  private getMatchingSubscriptions(event: AgentEvent): EventSubscription[] {
    const matching: EventSubscription[] = [];

    for (const subscription of this.subscriptions.values()) {
      const typeMatches =
        subscription.eventType === '*' ||
        subscription.eventType === event.type;

      const targetMatches =
        !event.targetAgentId ||
        event.targetAgentId === subscription.agentId;

      if (typeMatches && targetMatches) {
        matching.push(subscription);
      }
    }

    return matching;
  }

  /**
   * Add failed event to dead letter queue
   */
  private addToDeadLetterQueue(event: AgentEvent, error: string): void {
    const existingEntry = this.deadLetterQueue.find(
      e => e.event.id === event.id,
    );

    if (existingEntry) {
      existingEntry.attempts++;
      existingEntry.lastAttempt = new Date();
      existingEntry.error = error;
    } else {
      this.deadLetterQueue.push({
        event,
        error,
        attempts: 1,
        lastAttempt: new Date(),
      });
    }

    if (this.deadLetterQueue.length > 1000) {
      this.deadLetterQueue.shift();
    }
  }
}
