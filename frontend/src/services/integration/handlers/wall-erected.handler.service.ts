/**
 * WallErectedHandler - Compliance -> Security Integration
 *
 * Responsibility: Create row-level security policies for ethical walls
 * Integration: Opp #8 from architecture docs
 */


import { SystemEventType } from "@/types/integration-types";

import { BaseEventHandler } from "./base-event.handler.service";

import type { SystemEventPayloads } from "@/types/integration-types";

export class WallErectedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.WALL_ERECTED]
> {
  readonly eventType = SystemEventType.WALL_ERECTED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.WALL_ERECTED],
  ) {
    const actions: string[] = [];
    const { wall } = payload;

    const dataServiceModule =
      (await import("@/services/data/data-service.service"));
    const { DataService } = dataServiceModule;

    // Generate RLS policy for ethical wall
    const policyName = `wall_enforce_${wall.caseId}`;

    const { admin } = DataService as {
      admin: {
        saveRLSPolicy: (policy: {
          name: string;
          table: string;
          cmd: "SELECT";
          roles: string[];
          using: string;
          status: "Active";
        }) => Promise<void>;
      };
    };

    await admin.saveRLSPolicy({
      name: policyName,
      table: "documents",
      cmd: "SELECT",
      roles: wall.restrictedGroups,
      using: `case_id != '${wall.caseId}'`, // Prevent access
      status: "Active",
    });

    actions.push(`Generated RLS Policy: ${policyName}`);

    return this.createSuccess(actions);
  }
}
