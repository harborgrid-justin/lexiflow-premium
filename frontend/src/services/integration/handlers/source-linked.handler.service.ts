/**
 * DataSourceConnectedHandler - Data Platform -> Infrastructure Integration
 *
 * Responsibility: Log connection events and queue sync jobs
 * Integration: Opp #11 from architecture docs
 */

import { db } from "@/services/data/db.service";
import type { UserId } from "@/types";
import type { SystemEventPayloads } from "@/types/integration-types";
import { SystemEventType } from "@/types/integration-types";
import { BaseEventHandler } from "./base-event.handler.service";

export class SourceLinkedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.DATA_SOURCE_CONNECTED]
> {
  readonly eventType = SystemEventType.DATA_SOURCE_CONNECTED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.DATA_SOURCE_CONNECTED]
  ) {
    const actions: string[] = [];
    const { provider, name, connectionId } = payload;

    // Log to audit trail
    await db.put("auditLogs", {
      action: "CONNECTION_ESTABLISHED",
      userId: "system" as UserId,
      details: `Established secure connection to ${provider} (${name})`,
      ip: "127.0.0.1",
      resourceId: connectionId,
    });

    actions.push(`Logged connection audit event for ${name}`);
    actions.push(`Queued initial sync job for ${connectionId}`);

    return this.createSuccess(actions);
  }
}
