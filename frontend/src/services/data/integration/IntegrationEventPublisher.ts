/**
 * IntegrationEventPublisher
 * 
 * Responsibility: Publish domain events to the integration orchestrator
 * Pattern: Publisher/Event Emitter with domain-specific methods
 * 
 * This module decouples data operations from integration events, allowing
 * repositories to trigger cross-domain workflows without tight coupling.
 */

import { IntegrationOrchestrator } from '../../integration/integrationOrchestrator';
import { SystemEventType } from '../../../types/integration-types';
import type { Case, DocketEntry, LegalDocument, TimeEntry } from '../../../types';

/**
 * Centralized event publisher for data layer integration events
 */
export class IntegrationEventPublisher {
  /**
   * Publishes a case creation event
   */
  static async publishCaseCreated(caseData: Case): Promise<void> {
    await IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, {
      caseData
    });
  }

  /**
   * Publishes a docket entry ingestion event
   */
  static async publishDocketIngested(entry: DocketEntry): Promise<void> {
    await IntegrationOrchestrator.publish(SystemEventType.DOCKET_INGESTED, {
      entry,
      caseId: entry.caseId
    });
  }

  /**
   * Publishes a document upload event
   */
  static async publishDocumentUploaded(document: LegalDocument): Promise<void> {
    await IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, {
      document
    });
  }

  /**
   * Publishes a time entry logged event
   */
  static async publishTimeLogged(entry: TimeEntry): Promise<void> {
    await IntegrationOrchestrator.publish(SystemEventType.TIME_LOGGED, {
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
    await IntegrationOrchestrator.publish(SystemEventType.DATA_SOURCE_CONNECTED, {
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
    payload: Record<string, any>
  ): Promise<void> {
    await IntegrationOrchestrator.publish(eventType, payload);
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
export function createIntegratedRepository<TBase extends new (...args: unknown[]) => any>(
  Repository: TBase,
  publishAdd?: (item: unknown) => Promise<void>,
  publishUpdate?: (id: string, item: unknown) => Promise<void>,
  publishDelete?: (id: string) => Promise<void>
) {
  return class extends Repository {
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
