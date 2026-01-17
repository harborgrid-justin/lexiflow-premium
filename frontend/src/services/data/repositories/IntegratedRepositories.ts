import { CaseRepository } from "@/services/domain/case.service";
import { DocketRepository } from "@/services/domain/docket.service";

import {
  IntegrationEventPublisher,
  createIntegratedRepository,
} from "../integration/IntegrationEventPublisher";

import { BillingRepository } from "./BillingRepository";
import { DocumentRepository } from "./DocumentRepository";

import type { Case, DocketEntry, LegalDocument, TimeEntry } from "@/types";

/**
 * Integrated repositories automatically publish integration events on mutations.
 * This ensures all parts of the system stay synchronized via the event bus.
 */

export const IntegratedCaseRepository = createIntegratedRepository(
  CaseRepository,
  async (item: unknown) =>
    await IntegrationEventPublisher.publishCaseCreated(item as Case)
);

export const IntegratedDocketRepository = createIntegratedRepository(
  DocketRepository,
  async (item: unknown) =>
    await IntegrationEventPublisher.publishDocketIngested(item as DocketEntry)
);

export const IntegratedDocumentRepository = createIntegratedRepository(
  DocumentRepository,
  async (item: unknown) =>
    await IntegrationEventPublisher.publishDocumentUploaded(
      item as LegalDocument
    )
);

export class IntegratedBillingRepository extends BillingRepository {
  override async addTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    const result = await super.addTimeEntry(entry);
    await IntegrationEventPublisher.publishTimeLogged(result);
    return result;
  }
}
