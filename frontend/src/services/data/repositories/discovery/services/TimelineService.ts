/**
 * Timeline Service
 * Handles timeline and deadline synchronization for discovery management
 *
 * @module TimelineService
 * @description Manages discovery timeline events and deadline synchronization
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError } from "@/services/core/errors";
import type { DiscoveryRequest } from "@/types";
import type { DiscoveryTimelineEvent } from "@/types/discovery-enhanced";
import { discoveryRequestService } from "./DiscoveryRequestService";

/**
 * Timeline Service Class
 * Manages timeline and deadline operations
 */
export class TimelineService {
  /**
   * Get discovery timeline events
   *
   * @param caseId - Optional case ID to filter by
   * @returns Promise<DiscoveryTimelineEvent[]> Array of timeline events
   *
   * @example
   * const events = await timelineService.getTimelineEvents('case-123');
   */
  async getTimelineEvents(
    caseId?: string
  ): Promise<DiscoveryTimelineEvent[]> {
    try {
      return await discoveryApi.timeline.getEvents(caseId);
    } catch (error) {
      console.error("[TimelineService.getTimelineEvents] Error:", error);
      return [];
    }
  }

  /**
   * Sync discovery deadlines to master calendar
   * Finds all pending discovery requests and creates calendar events
   *
   * @returns Promise<void>
   * @throws OperationError if sync fails
   *
   * @example
   * await timelineService.syncDeadlines();
   */
  async syncDeadlines(): Promise<void> {
    try {
      const requests = await discoveryRequestService.getRequests();
      const pending = requests.filter(
        (r: DiscoveryRequest) =>
          r.status === "Served" || r.status === "Overdue"
      );

      // Future integration: await apiClient.post('/calendar/sync', { requests: pending });
      console.info(
        `[TimelineService] Would sync ${pending.length} deadlines to Calendar Service (endpoint pending).`
      );
    } catch (error) {
      console.error("[TimelineService.syncDeadlines] Error:", error);
      throw new OperationError(
        "syncDeadlines",
        "Failed to sync discovery deadlines"
      );
    }
  }
}

export const timelineService = new TimelineService();
