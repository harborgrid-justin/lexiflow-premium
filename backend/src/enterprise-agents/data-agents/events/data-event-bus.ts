/**
 * Data Event Bus
 *
 * Pub-sub event system for data agent communication.
 *
 * @module DataEventBus
 * @version 1.0.0
 */

import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataEvent } from "../interfaces/data-agent.interfaces";
import { v4 as uuidv4 } from "uuid";

type EventHandler = (event: DataEvent) => Promise<void>;

@Injectable()
export class DataEventBus {
  private readonly logger = new Logger(DataEventBus.name);
  private readonly subscribers = new Map<string, Set<EventHandler>>();
  private readonly eventHistory: DataEvent[] = [];
  private readonly maxHistorySize = 1000;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(
    type: string,
    sourceAgentId: string,
    payload: unknown,
    correlationId?: string
  ): Promise<void> {
    const event: DataEvent = {
      type,
      payload,
      sourceAgentId,
      timestamp: new Date(),
      correlationId: correlationId || uuidv4(),
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit via NestJS event emitter
    this.eventEmitter.emit(`data.${type}`, event);

    // Notify subscribers
    const handlers = this.subscribers.get(type) || new Set();
    const wildcardHandlers = this.subscribers.get("*") || new Set();

    const allHandlers = new Set([...handlers, ...wildcardHandlers]);

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error handling event ${type}: ${error}`);
      }
    }

    this.logger.debug(`Published event: ${type} from ${sourceAgentId}`);
  }

  subscribe(
    agentId: string,
    eventType: string,
    handler: EventHandler
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.add(handler);
    }

    this.logger.debug(`Agent ${agentId} subscribed to ${eventType}`);

    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  getRecentEvents(limit = 100): DataEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getEventsByType(type: string, limit = 100): DataEvent[] {
    return this.eventHistory.filter((e) => e.type === type).slice(-limit);
  }

  getEventsByAgent(agentId: string, limit = 100): DataEvent[] {
    return this.eventHistory
      .filter((e) => e.sourceAgentId === agentId)
      .slice(-limit);
  }
}
