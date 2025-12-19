/**
 * Event Handler Registry
 * 
 * Purpose: Central registry for all event handlers
 * Pattern: Registry + Factory
 */

// Export all handlers
export { BaseEventHandler } from './BaseEventHandler';
export { LeadStageChangedHandler } from './LeadStageChangedHandler';
export { DocketIngestedHandler } from './DocketIngestedHandler';
export { TaskCompletedHandler } from './TaskCompletedHandler';
export { DocumentUploadedHandler } from './DocumentUploadedHandler';
export { InvoiceStatusChangedHandler } from './InvoiceStatusChangedHandler';
export { EvidenceStatusUpdatedHandler } from './EvidenceStatusUpdatedHandler';
export { CitationSavedHandler } from './CitationSavedHandler';
export { WallErectedHandler } from './WallErectedHandler';
export { StaffHiredHandler } from './StaffHiredHandler';
export { ServiceCompletedHandler } from './ServiceCompletedHandler';
export { DataSourceConnectedHandler } from './DataSourceConnectedHandler';

// Import handlers for registry
import { LeadStageChangedHandler } from './LeadStageChangedHandler';
import { DocketIngestedHandler } from './DocketIngestedHandler';
import { TaskCompletedHandler } from './TaskCompletedHandler';
import { DocumentUploadedHandler } from './DocumentUploadedHandler';
import { InvoiceStatusChangedHandler } from './InvoiceStatusChangedHandler';
import { EvidenceStatusUpdatedHandler } from './EvidenceStatusUpdatedHandler';
import { CitationSavedHandler } from './CitationSavedHandler';
import { WallErectedHandler } from './WallErectedHandler';
import { StaffHiredHandler } from './StaffHiredHandler';
import { ServiceCompletedHandler } from './ServiceCompletedHandler';
import { DataSourceConnectedHandler } from './DataSourceConnectedHandler';
import type { BaseEventHandler } from './BaseEventHandler';

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
    this.register(new DataSourceConnectedHandler());
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
      registeredEvents: this.getRegisteredEvents()
    };
  }
}
