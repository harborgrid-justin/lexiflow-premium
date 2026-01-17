/**
 * @module services/calendarConflictService
 * @category Services
 * @description Detects calendar conflicts and suggests optimal meeting times with travel considerations.
 */

import { addMinutes, differenceInMinutes, format, addDays } from "date-fns";

import { SEARCH_PREVIEW_RESULTS } from "@/config/features/search.config";

/**
 * Calendar event definition
 */
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  isFlexible?: boolean; // Can be rescheduled
  priority?: "low" | "normal" | "high" | "critical";
  type?: "meeting" | "hearing" | "deadline" | "travel" | "blocked";
}

/**
 * Conflict detection result
 */
export interface ConflictDetection {
  hasConflict: boolean;
  conflicts: Conflict[];
  severity: "none" | "soft" | "hard";
}

/**
 * Individual conflict
 */
export interface Conflict {
  id: string;
  type: "overlap" | "back-to-back" | "travel-time" | "buffer-violation";
  event1: CalendarEvent;
  event2: CalendarEvent;
  overlapMinutes: number;
  suggestedResolution?: ConflictResolution[];
}

/**
 * Conflict resolution suggestion
 */
export interface ConflictResolution {
  id: string;
  type: "reschedule" | "shorten" | "cancel" | "virtual" | "delegate";
  description: string;
  affectedEvents: string[];
  newTimes?: Map<string, { start: Date; end: Date }>;
  confidence: number; // 0-1
}

/**
 * Time suggestion for new events
 */
export interface TimeSuggestion {
  id: string;
  startTime: Date;
  endTime: Date;
  confidence: number; // 0-1 based on conflicts and preferences
  reason: string;
  conflicts: Conflict[];
}

/**
 * Travel time calculation
 */
export interface TravelTime {
  fromLocation: string;
  toLocation: string;
  durationMinutes: number;
  mode: "walk" | "drive" | "transit" | "flight";
}

/**
 * Configuration options
 */
export interface ConflictServiceConfig {
  bufferMinutes: number; // Default buffer between meetings
  travelTimeMatrix: Map<string, Map<string, TravelTime>>; // Location-to-location travel times
  workingHours: {
    start: number; // Hour of day (0-23)
    end: number; // Hour of day (0-23)
  };
  preferredMeetingTimes?: {
    start: number; // Hour of day
    end: number;
  };
}

/**
 * Calendar Conflict Service
 */
export class CalendarConflictService {
  private config: ConflictServiceConfig;

  constructor(config: Partial<ConflictServiceConfig> = {}) {
    const baseConfig: ConflictServiceConfig = {
      bufferMinutes: config.bufferMinutes ?? 15,
      travelTimeMatrix: config.travelTimeMatrix ?? new Map(),
      workingHours: config.workingHours ?? { start: 9, end: 17 },
    };
    this.config = config.preferredMeetingTimes
      ? { ...baseConfig, preferredMeetingTimes: config.preferredMeetingTimes }
      : baseConfig;
  }

  /**
   * Detect conflicts for a new event against existing events
   */
  detectConflicts(
    newEvent: Omit<CalendarEvent, "id">,
    existingEvents: CalendarEvent[],
  ): ConflictDetection {
    const conflicts: Conflict[] = [];

    // Check direct time overlaps
    existingEvents.forEach((existing) => {
      const overlap = this.calculateOverlap(
        { start: newEvent.startTime, end: newEvent.endTime },
        { start: existing.startTime, end: existing.endTime },
      );

      if (overlap > 0) {
        conflicts.push({
          id: `conflict-${existing.id}-${Date.now()}`,
          type: "overlap",
          event1: { ...newEvent, id: "new" },
          event2: existing,
          overlapMinutes: overlap,
          suggestedResolution: this.generateResolutions(newEvent, existing),
        });
      }
    });

    // Check buffer violations (back-to-back without buffer)
    existingEvents.forEach((existing) => {
      const timeBetween = differenceInMinutes(
        new Date(newEvent.startTime),
        new Date(existing.endTime),
      );

      if (timeBetween >= 0 && timeBetween < this.config.bufferMinutes) {
        conflicts.push({
          id: `buffer-${existing.id}-${Date.now()}`,
          type: "buffer-violation",
          event1: { ...newEvent, id: "new" },
          event2: existing,
          overlapMinutes: this.config.bufferMinutes - timeBetween,
          suggestedResolution: [],
        });
      }
    });

    // Check travel time conflicts
    if (newEvent.location) {
      existingEvents.forEach((existing) => {
        if (!existing.location) return;

        const travelTime = this.getTravelTime(
          existing.location,
          newEvent.location!,
        );
        if (!travelTime) return;

        const timeBetween = differenceInMinutes(
          new Date(newEvent.startTime),
          new Date(existing.endTime),
        );

        if (timeBetween < travelTime.durationMinutes) {
          conflicts.push({
            id: `travel-${existing.id}-${Date.now()}`,
            type: "travel-time",
            event1: { ...newEvent, id: "new" },
            event2: existing,
            overlapMinutes: travelTime.durationMinutes - timeBetween,
            suggestedResolution: this.generateTravelResolutions(
              newEvent,
              existing,
              travelTime,
            ),
          });
        }
      });
    }

    // Determine severity
    let severity: "none" | "soft" | "hard" = "none";
    if (conflicts.length > 0) {
      const hasHardConflict = conflicts.some(
        (c) =>
          c.type === "overlap" ||
          (c.type === "travel-time" && c.overlapMinutes > 30),
      );
      severity = hasHardConflict ? "hard" : "soft";
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      severity,
    };
  }

  /**
   * Suggest optimal times for a new event
   */
  suggestTimes(
    duration: number, // in minutes
    existingEvents: CalendarEvent[],
    options: {
      preferredDate?: Date;
      earliestTime?: Date;
      latestTime?: Date;
      maxSuggestions?: number;
      requiredAttendees?: string[];
    } = {},
  ): TimeSuggestion[] {
    const suggestions: TimeSuggestion[] = [];
    const maxSuggestions = options.maxSuggestions ?? SEARCH_PREVIEW_RESULTS;

    // Start searching from preferred date or tomorrow
    let searchDate = options.preferredDate ?? addDays(new Date(), 1);
    const daysToSearch = 14; // Look ahead 2 weeks

    for (
      let day = 0;
      day < daysToSearch && suggestions.length < maxSuggestions;
      day++
    ) {
      const daySlots = this.findAvailableSlots(
        searchDate,
        duration,
        existingEvents,
        options,
      );
      suggestions.push(...daySlots);
      searchDate = addDays(searchDate, 1);
    }

    // Sort by confidence (best matches first)
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);
  }

  /**
   * Find available time slots for a specific day
   */
  private findAvailableSlots(
    date: Date,
    duration: number,
    existingEvents: CalendarEvent[],
    options: {
      requiredAttendees?: string[];
    },
  ): TimeSuggestion[] {
    const suggestions: TimeSuggestion[] = [];

    // Get working hours for this day
    const dayStart = new Date(date);
    dayStart.setHours(this.config.workingHours.start, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(this.config.workingHours.end, 0, 0, 0);

    // Filter events for this day
    const dayEvents = existingEvents.filter((event) =>
      this.isOverlapping(
        { start: dayStart, end: dayEnd },
        { start: event.startTime, end: event.endTime },
      ),
    );

    // Try every 30-minute slot
    let currentTime = new Date(dayStart);
    const slotInterval = 30; // Check every 30 minutes

    while (currentTime < dayEnd) {
      const slotEnd = addMinutes(currentTime, duration);

      if (slotEnd > dayEnd) break;

      // Check if this slot works
      const mockEvent: Omit<CalendarEvent, "id"> = {
        title: "New Event",
        startTime: currentTime,
        endTime: slotEnd,
      };

      const detection = this.detectConflicts(mockEvent, dayEvents);

      // Calculate confidence score
      let confidence = 1.0;

      // Penalize for conflicts
      if (detection.hasConflict) {
        confidence -= detection.conflicts.length * 0.2;
        if (detection.severity === "hard") confidence -= 0.3;
      }

      // Boost for preferred meeting times
      if (this.config.preferredMeetingTimes) {
        const hour = currentTime.getHours();
        if (
          hour >= this.config.preferredMeetingTimes.start &&
          hour < this.config.preferredMeetingTimes.end
        ) {
          confidence += 0.1;
        }
      }

      // Boost for beginning/end of day slots
      const hour = currentTime.getHours();
      if (
        hour === this.config.workingHours.start ||
        hour === this.config.workingHours.end - 1
      ) {
        confidence += 0.05;
      }

      // Check attendee availability if provided
      if (options.requiredAttendees) {
        const attendeeConflicts = detection.conflicts.filter((c) =>
          c.event2.attendees?.some((a) =>
            options.requiredAttendees!.includes(a),
          ),
        );
        if (attendeeConflicts.length > 0) {
          confidence -= attendeeConflicts.length * 0.15;
        }
      }

      confidence = Math.max(0, Math.min(1, confidence));

      // Only add if confidence is reasonable
      if (confidence >= 0.3) {
        suggestions.push({
          id: `suggestion-${currentTime.getTime()}`,
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          confidence,
          reason: this.generateReason(detection, confidence),
          conflicts: detection.conflicts,
        });
      }

      currentTime = addMinutes(currentTime, slotInterval);
    }

    return suggestions;
  }

  /**
   * Calculate overlap between two time intervals in minutes
   */
  private calculateOverlap(
    interval1: { start: Date; end: Date },
    interval2: { start: Date; end: Date },
  ): number {
    const start = new Date(
      Math.max(interval1.start.getTime(), interval2.start.getTime()),
    );
    const end = new Date(
      Math.min(interval1.end.getTime(), interval2.end.getTime()),
    );

    return start < end ? differenceInMinutes(end, start) : 0;
  }

  /**
   * Check if two intervals overlap
   */
  private isOverlapping(
    interval1: { start: Date; end: Date },
    interval2: { start: Date; end: Date },
  ): boolean {
    return this.calculateOverlap(interval1, interval2) > 0;
  }

  /**
   * Get travel time between locations
   */
  private getTravelTime(from: string, to: string): TravelTime | null {
    return this.config.travelTimeMatrix.get(from)?.get(to) ?? null;
  }

  /**
   * Generate resolution suggestions for conflicts
   */
  private generateResolutions(
    newEvent: Omit<CalendarEvent, "id">,
    conflictingEvent: CalendarEvent,
  ): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];

    // Suggest rescheduling if flexible
    if (conflictingEvent.isFlexible) {
      const newStart = new Date(conflictingEvent.endTime);
      const newEnd = addMinutes(
        newStart,
        differenceInMinutes(
          conflictingEvent.endTime,
          conflictingEvent.startTime,
        ),
      );

      resolutions.push({
        id: `reschedule-${conflictingEvent.id}`,
        type: "reschedule",
        description: `Reschedule "${conflictingEvent.title}" to ${format(newStart, "h:mm a")}`,
        affectedEvents: [conflictingEvent.id],
        newTimes: new Map([
          [conflictingEvent.id, { start: newStart, end: newEnd }],
        ]),
        confidence: 0.8,
      });
    }

    // Suggest shortening meeting
    if (conflictingEvent.priority !== "critical") {
      resolutions.push({
        id: `shorten-${conflictingEvent.id}`,
        type: "shorten",
        description: `Shorten "${conflictingEvent.title}" to end before new event`,
        affectedEvents: [conflictingEvent.id],
        confidence: 0.6,
      });
    }

    // Suggest making meeting virtual if location-based
    if (newEvent.location || conflictingEvent.location) {
      resolutions.push({
        id: `virtual-${conflictingEvent.id}`,
        type: "virtual",
        description: "Convert to virtual meeting to eliminate travel time",
        affectedEvents: [conflictingEvent.id],
        confidence: 0.7,
      });
    }

    return resolutions;
  }

  /**
   * Generate travel-specific resolutions
   */
  private generateTravelResolutions(
    newEvent: Omit<CalendarEvent, "id">,
    conflictingEvent: CalendarEvent,
    travelTime: TravelTime,
  ): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];

    // Suggest adding travel time buffer
    const adjustedStart = addMinutes(
      conflictingEvent.endTime,
      travelTime.durationMinutes + 15,
    );
    const adjustedEnd = addMinutes(
      adjustedStart,
      differenceInMinutes(newEvent.endTime, newEvent.startTime),
    );

    resolutions.push({
      id: `travel-buffer-${conflictingEvent.id}`,
      type: "reschedule",
      description: `Add ${travelTime.durationMinutes} min travel time from ${travelTime.fromLocation} to ${travelTime.toLocation}`,
      affectedEvents: ["new"],
      newTimes: new Map([["new", { start: adjustedStart, end: adjustedEnd }]]),
      confidence: 0.85,
    });

    // Suggest virtual alternative
    resolutions.push({
      id: `travel-virtual-${conflictingEvent.id}`,
      type: "virtual",
      description: "Convert to virtual meeting to eliminate travel",
      affectedEvents: ["new"],
      confidence: 0.75,
    });

    return resolutions;
  }

  /**
   * Generate human-readable reason for suggestion
   */
  private generateReason(
    detection: ConflictDetection,
    confidence: number,
  ): string {
    if (!detection.hasConflict) {
      return "No conflicts - optimal time slot";
    }

    if (detection.severity === "soft") {
      return "Minor conflicts - may need buffer adjustment";
    }

    if (confidence >= 0.7) {
      return "Some conflicts but flexible - good alternative";
    }

    return "Has conflicts - consider with caution";
  }

  /**
   * Add travel time between two locations
   */
  addTravelTime(travelTime: TravelTime): void {
    if (!this.config.travelTimeMatrix.has(travelTime.fromLocation)) {
      this.config.travelTimeMatrix.set(travelTime.fromLocation, new Map());
    }

    this.config.travelTimeMatrix
      .get(travelTime.fromLocation)!
      .set(travelTime.toLocation, travelTime);

    // Add reverse direction
    if (!this.config.travelTimeMatrix.has(travelTime.toLocation)) {
      this.config.travelTimeMatrix.set(travelTime.toLocation, new Map());
    }

    this.config.travelTimeMatrix
      .get(travelTime.toLocation)!
      .set(travelTime.fromLocation, {
        ...travelTime,
        fromLocation: travelTime.toLocation,
        toLocation: travelTime.fromLocation,
      });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConflictServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
let serviceInstance: CalendarConflictService | null = null;

/**
 * Get or create the calendar conflict service instance
 */
export function getCalendarConflictService(
  config?: Partial<ConflictServiceConfig>,
): CalendarConflictService {
  if (!serviceInstance) {
    serviceInstance = new CalendarConflictService(config);
  }
  return serviceInstance;
}

/**
 * Reset the service instance (useful for testing)
 */
export function resetCalendarConflictService(): void {
  serviceInstance = null;
}

export default CalendarConflictService;
