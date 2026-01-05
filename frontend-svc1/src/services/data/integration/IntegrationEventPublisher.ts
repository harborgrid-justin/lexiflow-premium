/**
 * IntegrationEventPublisher
 *
 * Responsibility: Publish domain events to the integration orchestrator
 * Pattern: Publisher/Event Emitter with domain-specific methods
 *
 * This module decouples data operations from integration events, allowing
 * repositories to trigger cross-domain workflows without tight coupling.
 */

import type { Case, DocketEntry, LegalDocument, TimeEntry } from "@/types";
import { SystemEventType } from "@/types/integration-types";

type EventHandler = (payload: unknown) => Promise<void>;

/**
 * Centralized event publisher for data layer integration events
 */
export class IntegrationEventPublisher {
  private static listeners = new Map<string, EventHandler[]>();

  /**
   * Subscribe to an event type
   */
  static subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(handler);
    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publishes a case creation event
   */
  static async publishCaseCreated(caseData: Case): Promise<void> {
    await this.publish(SystemEventType.CASE_CREATED, {
      caseData,
    });
  }

  /**
   * Publishes a docket entry ingestion event
   */
  static async publishDocketIngested(entry: DocketEntry): Promise<void> {
    await this.publish(SystemEventType.DOCKET_INGESTED, {
      entry,
      caseId: entry.caseId,
    });
  }

  /**
   * Publishes a document upload event
   */
  static async publishDocumentUploaded(document: LegalDocument): Promise<void> {
    await this.publish(SystemEventType.DOCUMENT_UPLOADED, {
      document,
    });
  }

  /**
   * Publishes a time entry logged event
   */
  static async publishTimeLogged(entry: TimeEntry): Promise<void> {
    await this.publish(SystemEventType.TIME_LOGGED, {
      entry,
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
      name,
    });
  }

  /**
   * Generic event publisher for custom event types
   */
  static async publish(
    eventType: SystemEventType,
    payload:
      | { caseData: Case }
      | { matter: unknown }
      | { leadId: string; stage: string; clientName: string; value: string }
      | { entry: DocketEntry; caseId: string }
      | { task: unknown }
      | { document: LegalDocument }
      | { entry: TimeEntry }
      | { invoice: unknown }
      | { connectionId: string; provider: string; name: string }
      | { citation: unknown; queryContext: string }
      | Record<string, unknown>
  ): Promise<void> {
    const handlers = this.listeners.get(eventType) || [];
    await Promise.all(handlers.map((h) => h(payload)));
  }
}

/**
 * Creates an integrated repository wrapper that publishes events on mutations
 *
 * @param Repository - Base repository class
 * @param publishAdd
 * @param publishUpdate
 * @param publishDelete
 * @param publishUpdate
 * @param publishDelete
 * @param publishUpdate
 * @param publishDelete
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
interface RepositoryInterface {
  add(item: unknown): Promise<unknown>;
  update(id: string, updates: unknown): Promise<unknown>;
  delete(id: string): Promise<unknown>;
}

export function createIntegratedRepository<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TBase extends new (...args: any[]) => RepositoryInterface,
>(
  Repository: TBase,
  publishAdd?: (item: unknown) => Promise<void>,
  publishUpdate?: (id: string, item: unknown) => Promise<void>,
  publishDelete?: (id: string) => Promise<void>
) {
  return class IntegratedRepository extends Repository {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    override async add(item: unknown): Promise<unknown> {
      const result = await super.add(item);
      if (publishAdd) {
        await publishAdd(result);
      }
      return result;
    }

    override async update(id: string, updates: unknown): Promise<unknown> {
      const result = await super.update(id, updates);
      if (publishUpdate) {
        await publishUpdate(id, result);
      }
      return result;
    }

    override async delete(id: string): Promise<unknown> {
      const result = await super.delete(id);
      if (publishDelete) {
        await publishDelete(id);
      }
      return result;
    }
  };
}
