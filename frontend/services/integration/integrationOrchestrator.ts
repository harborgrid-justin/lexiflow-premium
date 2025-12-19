/**
 * Enterprise Integration Bus (Refactored)
 * 
 * Purpose: Event-driven integration orchestrator
 * Pattern: Mediator + Event Bus + Registry
 * 
 * Refactoring completed: 2025-12-19
 * - Extracted 11 event handlers into separate, cohesive modules
 * - Replaced 300+ line switch statement with handler registry
 * - Separated validation, business logic, and data access
 * - 85% code reduction (358 lines → 53 lines)
 * 
 * Responsibilities:
 * - Route events to appropriate handlers
 * - Provide consistent error handling
 * - Log integration activity
 * 
 * Does NOT contain:
 * - Business logic (moved to handlers)
 * - Validation (moved to handlers)
 * - Direct database access (encapsulated in handlers)
 */

import type { SystemEventPayloads, IntegrationResult } from '../../types/integration-types';
import { EventHandlerRegistry } from './handlers';

/**
 * Enterprise Integration Bus
 * Decouples modules by handling side-effects of core actions.
 */
export const IntegrationOrchestrator = {
    
    /**
     * Publish an event to the integration bus
     * Routes to appropriate handler via registry
     */
    publish: async <K extends keyof SystemEventPayloads>(
        type: K, 
        payload: SystemEventPayloads[K]
    ): Promise<IntegrationResult> => {
        console.log(`[Orchestrator] Received event: ${type}`);
        
        try {
            // Get handler from registry
            const handler = EventHandlerRegistry.getHandler(type as string);
            
            if (!handler) {
                console.warn(`[Orchestrator] No handler registered for event: ${type}`);
                return {
                    success: true,
                    triggeredActions: [],
                    errors: [`No handler registered for ${type}`]
                };
            }
            
            // Execute handler
            const result = await handler.execute(payload);
            
            console.log(`[Orchestrator] Event ${type} completed:`, {
                success: result.success,
                actions: result.triggeredActions.length,
                errors: result.errors.length
            });
            
            return result;
            
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[Orchestrator] Fatal error processing ${type}:`, errorMsg);
            
            return {
                success: false,
                triggeredActions: [],
                errors: [errorMsg]
            };
        }
    },
    
    /**
     * Get integration statistics
     */
    getStats() {
        return EventHandlerRegistry.getStats();
    }
};

