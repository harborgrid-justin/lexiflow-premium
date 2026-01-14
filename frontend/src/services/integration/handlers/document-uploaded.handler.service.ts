/**
 * DocumentUploadedHandler - Documents -> Evidence Integration
 *
 * Responsibility: Auto-replicate production documents to evidence vault with chain of custody
 * Integration: Opp #4 from architecture docs
 */

import type { EvidenceId, EvidenceItem, UUID } from "@/types";
import type {
  IntegrationResult,
  SystemEventPayloads,
} from "@/types/integration-types";
import { SystemEventType } from "@/types/integration-types";
import { BaseEventHandler } from "./base-event.handler.service";

export class DocumentUploadedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.DOCUMENT_UPLOADED]
> {
  readonly eventType = SystemEventType.DOCUMENT_UPLOADED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.DOCUMENT_UPLOADED]
  ): Promise<IntegrationResult> {
    const actions: string[] = [];
    const { document } = payload;

    // Only replicate production/evidence documents
    if (!this.shouldReplicateToEvidence(document)) {
      return this.createSuccess([]);
    }

    // Dynamic import to avoid circular dependency
    const { DataService } = await import("@/services/data/dataService");

    const evidenceItem: EvidenceItem = {
      id: `ev-auto-${Date.now()}` as EvidenceId,
      trackingUuid: crypto.randomUUID() as UUID,
      caseId: document.caseId,
      title: document.title,
      type: "Document",
      description: "Auto-ingested from Document Upload",
      collectionDate: new Date().toISOString().split("T")[0]!,
      collectedBy: "System Import",
      custodian: "DMS",
      location: "Digital Vault",
      admissibility: "Pending",
      chainOfCustody: [
        {
          id: `cc-${Date.now()}`,
          date: new Date().toISOString(),
          action: "Ingestion",
          actor: "IntegrationOrchestrator",
        },
      ],
      tags: ["Auto-Ingest"],
      fileSize:
        typeof document.fileSize === "number"
          ? String(document.fileSize)
          : document.fileSize,
    };

    await DataService.evidence.add(evidenceItem);
    actions.push("Replicated Document to Evidence Vault");

    return this.createSuccess(actions);
  }

  private shouldReplicateToEvidence(
    document: SystemEventPayloads[typeof SystemEventType.DOCUMENT_UPLOADED]["document"]
  ): boolean {
    const isProduction =
      document.tags.includes("Production") || document.title.includes("Prod_");
    const isEvidence = document.sourceModule === "Evidence";
    return isProduction || isEvidence;
  }
}
