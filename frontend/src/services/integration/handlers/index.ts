/**
 * Event Handler Registry
 *
 * Purpose: Central registry for all event handlers
 * Pattern: Registry + Factory
 */

// Export all handlers
export { BaseEventHandler } from "./base-event.handler.service";
export { CitationSavedHandler } from "./citation-saved.handler.service";
export { DocketIngestedHandler } from "./docket-ingested.handler.service";
export { DocumentUploadedHandler } from "./document-uploaded.handler.service";
export { EvidenceStatusUpdatedHandler } from "./evidence-status-updated.handler.service";
export { InvoiceStatusChangedHandler } from "./invoice-status-changed.handler.service";
export { LeadStageChangedHandler } from "./lead-stage-changed.handler.service";
export { ServiceCompletedHandler } from "./service-completed.handler.service";
export { SourceLinkedHandler } from "./source-linked.handler.service";
export { StaffHiredHandler } from "./staff-hired.handler.service";
export { TaskCompletedHandler } from "./task-completed.handler.service";
export { WallErectedHandler } from "./wall-erected.handler.service";

// Import handlers for registry
import { CitationSavedHandler } from "./citation-saved.handler.service";
import { DocketIngestedHandler } from "./docket-ingested.handler.service";
import { DocumentUploadedHandler } from "./document-uploaded.handler.service";
import { EvidenceStatusUpdatedHandler } from "./evidence-status-updated.handler.service";
import { InvoiceStatusChangedHandler } from "./invoice-status-changed.handler.service";
import { LeadStageChangedHandler } from "./lead-stage-changed.handler.service";
import { ServiceCompletedHandler } from "./service-completed.handler.service";
import { SourceLinkedHandler } from "./source-linked.handler.service";
import { StaffHiredHandler } from "./staff-hired.handler.service";
import { TaskCompletedHandler } from "./task-completed.handler.service";
import { WallErectedHandler } from "./wall-erected.handler.service";

import type { BaseEventHandler } from "./base-event.handler.service";

/**
 * Registry of all event handlers
 * Maps event types to handler instances
 *
 * Benefits:
 * - Single source of truth for event routing
 * - Easy to add new handlers without modifying core logic
 * - Type-safe event dispatch
 */
export class EventHandlerRegistry {
  private static handlers = new Map<string, BaseEventHandler>();

  static {
    // Register all handlers (executed once on module load)
    this.register(new LeadStageChangedHandler());
    this.register(new DocketIngestedHandler());
    this.register(new TaskCompletedHandler());
    this.register(new DocumentUploadedHandler());
    this.register(new InvoiceStatusChangedHandler());
    this.register(new EvidenceStatusUpdatedHandler());
    this.register(new CitationSavedHandler());
    this.register(new WallErectedHandler());
    this.register(new StaffHiredHandler());
    this.register(new ServiceCompletedHandler());
    this.register(new SourceLinkedHandler());
  }

  /**
   * Register a handler for an event type
   */
  static register(handler: BaseEventHandler): void {
    this.handlers.set(handler.eventType, handler);
  }

  /**
   * Get handler for an event type
   */
  static getHandler(eventType: string): BaseEventHandler | undefined {
    return this.handlers.get(eventType);
  }

  /**
   * Check if handler exists for event type
   */
  static hasHandler(eventType: string): boolean {
    return this.handlers.has(eventType);
  }

  /**
   * Get all registered event types
   */
  static getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get statistics about registered handlers
   */
  static getStats() {
    return {
      totalHandlers: this.handlers.size,
      registeredEvents: this.getRegisteredEvents(),
    };
  }
}
