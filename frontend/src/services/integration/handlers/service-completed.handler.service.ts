/**
 * ServiceCompletedHandler - Service -> Docket Integration
 *
 * Responsibility: Auto-file proof of service to docket
 * Integration: Opp #10 from architecture docs
 */

import { SystemEventType } from "@/types/integration-types";

import { BaseEventHandler } from "./base-event.handler.service";

import type { DocketEntry, DocketId } from "@/types";
import type { SystemEventPayloads } from "@/types/integration-types";

export class ServiceCompletedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED]
> {
  readonly eventType = SystemEventType.SERVICE_COMPLETED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED],
  ) {
    const actions: string[] = [];
    const { job } = payload;

    // Only file for successfully served documents
    if (job.status !== "SERVED") {
      return this.createSuccess([]);
    }

    const dataServiceModule =
      await import("@/services/data/data-service.service");
    const { DataService } = dataServiceModule;

    const todayDate = new Date().toISOString().split("T")[0]!;
    const entry: DocketEntry = {
      id: `dk-proof-${Date.now()}` as DocketId,
      sequenceNumber: 999,
      caseId: job.caseId,
      dateFiled: todayDate,
      entryDate: todayDate,
      date: todayDate,
      type: "Filing",
      title: `Proof of Service: ${job.documentTitle}`,
      description: `Served on ${job.targetPerson} at ${job.targetAddress} by ${job.serverName}.`,
      filedBy: "System Automation",
      isSealed: false,
    };

    const { docket } = DataService as {
      docket: { add: (payload: DocketEntry) => Promise<void> };
    };
    await docket.add(entry);
    actions.push("Auto-filed Proof of Service to Docket");

    return this.createSuccess(actions);
  }
}
