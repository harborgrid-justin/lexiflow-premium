/**
 * IntegrationEventPublisher
 * 
 * Responsibility: Publish domain events to the integration orchestrator
 * Pattern: Publisher/Event Emitter with domain-specific methods
 * 
 * This module decouples data operations from integration events, allowing
 * repositories to trigger cross-domain workflows without tight coupling.
 */

import { SystemEventType } from '@/types/integration-types';
import type { Case, DocketEntry, LegalDocument, TimeEntry } from '@/types';

type EventHandler = (payload: any) => Promise<void>;

/**
 * Centralized event publisher for data layer integration events
 */
export class IntegrationEventPublisher {
  private static listeners = new Map<string, EventHandler[]>();

  /**
   * Subscribe to an event type
   */
  static subscribe(eventType: string, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(handler);
  }

  /**
   * Publishes a case creation event
   */
  static async publishCaseCreated(caseData: Case): Promise<void> {
    await this.publish(SystemEventType.CASE_CREATED, {
      caseData
    });
  }

  /**
   * Publishes a docket entry ingestion event
   */
  static async publishDocketIngested(entry: DocketEntry): Promise<void> {
    await this.publish(SystemEventType.DOCKET_INGESTED, {
      entry,
      caseId: entry.caseId
    });
  }

  /**
   * Publishes a document upload event
   */
  static async publishDocumentUploaded(document: LegalDocument): Promise<void> {
    await this.publish(SystemEventType.DOCUMENT_UPLOADED, {
      document
    });
  }

  /**
   * Publishes a time entry logged event
   */
  static async publishTimeLogged(entry: TimeEntry): Promise<void> {
    await this.publish(SystemEventType.TIME_LOGGED, {
      entry
    });
  }

  /**
   * Publishes a data source connection event
   */
  static async publishDataSourceConnected(
    connectionId: string,
    provider: string,
    name: string
  ): Promise<void> {
    await this.publish(SystemEventType.DATA_SOURCE_CONNECTED, {
      connectionId,
      provider,
      name
    });
  }

  /**
   * Generic event publisher for custom event types
   */
  static async publish(
    eventType: SystemEventType,
    payload: { caseData: Case } | { matter: unknown } | { leadId: string; stage: string; clientName: string; value: string } | { entry: DocketEntry; caseId: string } | { task: unknown } | { document: LegalDocument } | { entry: TimeEntry } | { invoice: unknown } | { connectionId: string; provider: string; name: string } | { citation: unknown; queryContext: string } | Record<string, unknown>
  ): Promise<void> {
    const handlers = this.listeners.get(eventType) || [];
    await Promise.all(handlers.map(h => h(payload)));
  }
}

/**
 * Creates an integrated repository wrapper that publishes events on mutations
 * 
 * @param Repository - Base repository class
 * @param eventPublisher - Function to publish event after mutation
 * @returns Extended repository class with event publishing
 * 
 * Example:
 * ```ts
 * class IntegratedCaseRepository extends createIntegratedRepository(
 *   CaseRepository,
 *   (item) => IntegrationEventPublisher.publishCaseCreated(item)
 * ) {}
 * ```
 */
export function createIntegratedRepository<TBase extends new (...args: any[]) => any>(
  Repository: TBase,
  publishAdd?: (item: unknown) => Promise<void>,
  publishUpdate?: (id: string, item: unknown) => Promise<void>,
  publishDelete?: (id: string) => Promise<void>
) {
  return class IntegratedRepository extends Repository {
    constructor(...args: any[]) {
      super(...args);
    }

    async add(item: unknown): Promise<unknown> {
      const result = await super.add(item);
      if (publishAdd) {
        await publishAdd(result);
      }
      return result;
    }

    async update(id: string, updates: unknown): Promise<unknown> {
      const result = await super.update(id, updates);
      if (publishUpdate) {
        await publishUpdate(id, result);
      }
      return result;
    }

    async delete(id: string): Promise<unknown> {
      const result = await super.delete(id);
      if (publishDelete) {
        await publishDelete(id);
      }
      return result;
    }
  };
}
