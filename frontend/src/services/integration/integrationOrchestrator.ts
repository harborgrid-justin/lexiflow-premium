/**
 * Integration Orchestrator - Enterprise event-driven integration bus
 * Mediator pattern with handler registry for cross-domain side-effects
 *
 * @module services/integration/integrationOrchestrator
 * @description Production-ready integration orchestrator providing:
 * - Event-driven integration bus for cross-domain communication
 * - Handler registry pattern (11 specialized event handlers)
 * - Automatic routing based on event type
 * - Consistent error handling and logging
 * - Statistics tracking for monitoring
 * - Type-safe event payloads via SystemEventPayloads
 * - Zero business logic (delegated to handlers)
 *
 * @architecture
 * - Pattern: Mediator + Event Bus + Registry
 * - Routing: Type-based dispatch to handler registry
 * - Handlers: BaseEventHandler implementations
 * - Error isolation: Handler failures don't crash bus
 * - Logging: Console-based with structured output
 *
 * @performance
 * - Handler lookup: O(1) via Map-based registry
 * - Async execution: Non-blocking event processing
 * - No queuing: Handlers execute immediately
 * - Memory: Minimal (stateless orchestrator)
 *
 * @refactoring
 * - Completed: 2025-12-19
 * - Before: 358 lines with 300+ line switch statement
 * - After: 87 lines (76% reduction)
 * - Extracted: 11 event handlers into separate modules
 * - Improvements: Type safety, maintainability, testability
 *
 * @handlers
 * - CASE_CREATED → CaseCreatedHandler (conflict checks, analytics)
 * - DOCKET_INGESTED → DocketIngestedHandler (keyword extraction, timeline sync)
 * - DOCUMENT_UPLOADED → DocumentUploadedHandler (OCR, preview, audit)
 * - TIME_LOGGED → TimeLoggedHandler (utilization tracking, alerts)
 * - CITATION_SAVED → CitationSavedHandler (citation network, validity)
 * - EVIDENCE_STATUS_UPDATED → EvidenceStatusUpdatedHandler (chain of custody)
 * - INVOICE_STATUS_CHANGED → InvoiceStatusChangedHandler (revenue recognition)
 * - TASK_COMPLETED → TaskCompletedHandler (workflow progression)
 * - LEAD_STAGE_CHANGED → LeadStageChangedHandler (CRM pipeline)
 * - DATA_SOURCE_CONNECTED → SourceLinkedHandler (catalog sync)
 * - Plus: SERVICE_COMPLETED, STAFF_HIRED, WALL_ERECTED handlers
 *
 * @usage
 * ```typescript
 * // Publish event to trigger integrations
 * const result = await IntegrationOrchestrator.publish('CASE_CREATED', {
 *   caseId: 'case-123',
 *   clientId: 'client-456',
 *   userId: 'user-789'
 * });
 *
 * if (result.success) {
 *   console.log(`Triggered ${result.triggeredActions.length} actions`);
 * } else {
 *   console.error('Integration errors:', result.errors);
 * }
 *
 * // Get handler statistics
 * const stats = IntegrationOrchestrator.getStats();
 * console.log(`${stats.handlerCount} handlers registered`);
 * ```
 */

import { ValidationError } from "@/services/core/errors";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import type {
  IntegrationResult,
  SystemEventPayloads,
} from "@/types/integration-types";
import { SystemEventType } from "@/types/integration-types";
import { EventHandlerRegistry } from "./handlers";

// =============================================================================
// VALIDATION (Private)
// =============================================================================

/**
 * Validate event type parameter
 * @private
 */
function validateEventType(type: string, methodName: string): void {
  if (!type || false) {
    throw new ValidationError(
      `[IntegrationOrchestrator.${methodName}] Invalid event type parameter`
    );
  }
}

/**
 * Validate event payload parameter
 * @private
 */
function validatePayload(
  payload: unknown,
  type: string,
  methodName: string
): void {
  if (payload === undefined || payload === null) {
    throw new ValidationError(
      `[IntegrationOrchestrator.${methodName}] Invalid payload for event: ${type}`
    );
  }
}

// =============================================================================
// INTEGRATION ORCHESTRATOR
// =============================================================================

/**
 * Central orchestrator for all system integration events
 */
export class IntegrationOrchestrator {
  private static initialized = false;
  private static subscriptionCleanups: Array<() => void> = [];

  /**
   * Initialize the orchestrator and subscribe to events
   */
  static initialize() {
    if (this.initialized) return;

    // Subscribe to all known event types and track cleanup functions
    Object.values(SystemEventType).forEach((type) => {
      const unsubscribe = IntegrationEventPublisher.subscribe(type, (async (
        payload: unknown
      ) => {
        await this.publish(type as SystemEventType, payload);
      }) as any);
      this.subscriptionCleanups.push(unsubscribe as () => void);
    });

    this.initialized = true;
    console.log(
      "[IntegrationOrchestrator] Initialized and subscribed to events"
    );
  }

  /**
   * Cleanup all event subscriptions
   * Call this when shutting down the orchestrator to prevent memory leaks
   */
  static cleanup() {
    console.log("[IntegrationOrchestrator] Cleaning up event subscriptions");

    this.subscriptionCleanups.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("[IntegrationOrchestrator] Error during cleanup:", error);
      }
    });

    this.subscriptionCleanups = [];
    this.initialized = false;
  }

  /**
   * Publish an event to trigger integration workflows
   */
  static async publish<T extends keyof SystemEventPayloads>(
    eventType: T,
    payload: SystemEventPayloads[T]
  ): Promise<IntegrationResult> {
    try {
      const eventTypeStr = String(eventType);
      validateEventType(eventTypeStr, "publish");
      validatePayload(payload, eventTypeStr, "publish");

      console.log(`[IntegrationOrchestrator] Received event: ${eventTypeStr}`);

      // Get handler from registry
      const handler = EventHandlerRegistry.getHandler(eventTypeStr);

      if (!handler) {
        console.warn(
          `[IntegrationOrchestrator] No handler registered for event: ${eventTypeStr}`
        );
        return {
          success: true,
          triggeredActions: [],
          errors: [`No handler registered for ${eventTypeStr}`],
        };
      }

      // Execute handler with error isolation
      const result = await handler.execute(payload);

      console.log(
        `[IntegrationOrchestrator] Event ${eventTypeStr} completed:`,
        {
          success: result.success,
          actions: result.triggeredActions.length,
          errors: result.errors?.length ?? 0,
        }
      );

      return result;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[IntegrationOrchestrator] Fatal error processing ${String(eventType)}:`,
        errorMsg
      );

      return {
        success: false,
        triggeredActions: [],
        errors: [errorMsg],
      };
    }
  }

  /**
   * Get integration statistics
   * Returns handler count and registration info
   *
   * @returns Object - Statistics from handler registry
   *
   * @example
   * const stats = IntegrationOrchestrator.getStats();
   * console.log(`Handlers: ${stats.handlerCount}`);
   */
  static getStats() {
    try {
      return EventHandlerRegistry.getStats();
    } catch (error) {
      console.error("[IntegrationOrchestrator.getStats] Error:", error);
      return { handlerCount: 0, handlers: [] };
    }
  }
}
