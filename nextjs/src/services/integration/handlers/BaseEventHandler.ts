/**
 * BaseEventHandler - Abstract base class for event handlers
 *
 * Purpose: Provides common interface and error handling for all event handlers
 * Pattern: Template Method + Strategy
 */

import type { IntegrationResult } from "@/types/integration-types";

export abstract class BaseEventHandler<TPayload = unknown> {
  abstract readonly eventType: string;

  /**
   * Handle the event and return the integration result
   */
  abstract handle(payload: TPayload): Promise<IntegrationResult>;

  /**
   * Wrapper method that provides consistent error handling
   */
  async execute(payload: TPayload): Promise<IntegrationResult> {
    const actions: string[] = [];
    const errors: string[] = [];

    try {
      console.log(`[${this.eventType}] Processing event`, payload);
      const result = await this.handle(payload);
      return result;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${this.eventType}] Error:`, errorMsg);
      errors.push(errorMsg);
      return { success: false, triggeredActions: actions, errors };
    }
  }

  /**
   * Helper to create successful result
   */
  protected createSuccess(actions: string[]): IntegrationResult {
    return { success: true, triggeredActions: actions, errors: [] };
  }

  /**
   * Helper to create error result
   */
  protected createError(
    errors: string[],
    actions: string[] = []
  ): IntegrationResult {
    return { success: false, triggeredActions: actions, errors };
  }
}
