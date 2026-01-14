/**
 * EvidenceStatusUpdatedHandler - Evidence -> Audit Integration
 *
 * Responsibility: Log evidence status changes to immutable blockchain
 * Integration: Opp #6 from architecture docs
 */

import { ChainService } from "@/services/infrastructure/chainService";
import type { UserId } from "@/types";
import type { SystemEventPayloads } from "@/types/integration-types";
import { SystemEventType } from "@/types/integration-types";
import { BaseEventHandler } from "./base-event.handler.service";

export class EvidenceStatusUpdatedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.EVIDENCE_STATUS_UPDATED]
> {
  readonly eventType = SystemEventType.EVIDENCE_STATUS_UPDATED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.EVIDENCE_STATUS_UPDATED]
  ) {
    const actions: string[] = [];
    const { item, oldStatus, newStatus } = payload;

    // Create cryptographic audit entry
    await ChainService.createEntry(
      {
        timestamp: new Date().toISOString(),
        user: "System",
        userId: "sys-admin" as UserId,
        action: `EVIDENCE_STATUS_${newStatus.toUpperCase().replace(/\s/g, "_")}`,
        resource: `Evidence/${item.id}`,
        ip: "internal",
        previousValue: oldStatus,
        newValue: newStatus,
      },
      "0000000000000000000000000000000000000000000000000000000000000000"
    );

    actions.push("Logged Evidence Status Change to Immutable Ledger");

    return this.createSuccess(actions);
  }
}
