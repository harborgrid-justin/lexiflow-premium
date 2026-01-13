import { Injectable, Logger } from "@nestjs/common";
import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-client";

/**
 * Microsoft Outlook Event Interface
 */
interface OutlookEvent {
  id: string;
  subject?: string;
  body?: {
    content?: string;
  };
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  location?: {
    displayName?: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
    };
  }>;
  reminderMinutesBeforeStart?: number;
}

/**
 * Calendar Event
 */
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // minutes before event
  provider: "google" | "outlook";
}

/**
 * Calendar Integration Service
 * Real integration with Google Calendar and Microsoft Outlook
 * Supports OAuth 2.0 authentication and calendar sync
 *
 * @example
 * const events = await calendarService.listEvents('google', accessToken, {
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 * });
 */
/**
 * ╔=================================================================================================================╗
 * ║CALENDARINTEGRATION                                                                                              ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CalendarIntegrationService {
  private readonly logger = new Logger(CalendarIntegrationService.name);

  /**
   * List calendar events from provider
   */
  async listEvents(
    provider: "google" | "outlook",
    accessToken: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      maxResults?: number;
    } = {}
  ): Promise<CalendarEvent[]> {
    if (provider === "google") {
      return this.listGoogleEvents(accessToken, options);
    } else {
      return this.listOutlookEvents(accessToken, options);
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(
    provider: "google" | "outlook",
    accessToken: string,
    event: Omit<CalendarEvent, "id" | "provider">
  ): Promise<CalendarEvent> {
    if (provider === "google") {
      return this.createGoogleEvent(accessToken, event);
    } else {
      return this.createOutlookEvent(accessToken, event);
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    provider: "google" | "outlook",
    accessToken: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    if (provider === "google") {
      return this.updateGoogleEvent(accessToken, eventId, updates);
    } else {
      return this.updateOutlookEvent(accessToken, eventId, updates);
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(
    provider: "google" | "outlook",
    accessToken: string,
    eventId: string
  ): Promise<void> {
    if (provider === "google") {
      await this.deleteGoogleEvent(accessToken, eventId);
    } else {
      await this.deleteOutlookEvent(accessToken, eventId);
    }
  }

  // ==================== Google Calendar ====================

  private async listGoogleEvents(
    accessToken: string,
    options: { startDate?: Date; endDate?: Date; maxResults?: number }
  ): Promise<CalendarEvent[]> {
    try {
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: options.startDate?.toISOString(),
        timeMax: options.endDate?.toISOString(),
        maxResults: options.maxResults || 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      return (response.data.items || []).map((event) =>
        this.mapGoogleEvent(event)
      );
    } catch (error) {
      this.logger.error("Failed to list Google Calendar events", error);
      throw new Error("Failed to fetch Google Calendar events");
    }
  }

  private async createGoogleEvent(
    accessToken: string,
    event: Omit<CalendarEvent, "id" | "provider">
  ): Promise<CalendarEvent> {
    try {
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const googleEvent: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: "UTC",
        },
        attendees: event.attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: event.reminders?.map((minutes) => ({
            method: "popup",
            minutes,
          })),
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: googleEvent,
      });

      return this.mapGoogleEvent(response.data);
    } catch (error) {
      this.logger.error("Failed to create Google Calendar event", error);
      throw new Error("Failed to create Google Calendar event");
    }
  }

  private async updateGoogleEvent(
    accessToken: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const googleEvent: calendar_v3.Schema$Event = {};

      if (updates.summary) googleEvent.summary = updates.summary;
      if (updates.description) googleEvent.description = updates.description;
      if (updates.location) googleEvent.location = updates.location;
      if (updates.start) {
        googleEvent.start = {
          dateTime: updates.start.toISOString(),
          timeZone: "UTC",
        };
      }
      if (updates.end) {
        googleEvent.end = {
          dateTime: updates.end.toISOString(),
          timeZone: "UTC",
        };
      }
      if (updates.attendees) {
        googleEvent.attendees = updates.attendees.map((email) => ({ email }));
      }

      const response = await calendar.events.patch({
        calendarId: "primary",
        eventId,
        requestBody: googleEvent,
      });

      return this.mapGoogleEvent(response.data);
    } catch (error) {
      this.logger.error("Failed to update Google Calendar event", error);
      throw new Error("Failed to update Google Calendar event");
    }
  }

  private async deleteGoogleEvent(
    accessToken: string,
    eventId: string
  ): Promise<void> {
    try {
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });

      this.logger.log(`Deleted Google Calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error("Failed to delete Google Calendar event", error);
      throw new Error("Failed to delete Google Calendar event");
    }
  }

  private mapGoogleEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    const eventId = event.id;
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const emailAddresses = event.attendees
      ?.map((a) => a.email)
      .filter((email): email is string => Boolean(email));
    const reminderMinutes = event.reminders?.overrides
      ?.map((r) => r.minutes)
      .filter((min): min is number => Boolean(min));

    return {
      id: eventId,
      summary: event.summary || "",
      description: event.description ?? undefined,
      start: new Date(event.start?.dateTime || event.start?.date || ""),
      end: new Date(event.end?.dateTime || event.end?.date || ""),
      location: event.location ?? undefined,
      attendees: emailAddresses,
      reminders: reminderMinutes,
      provider: "google",
    };
  }

  // ==================== Microsoft Outlook ====================

  private async listOutlookEvents(
    accessToken: string,
    options: { startDate?: Date; endDate?: Date; maxResults?: number }
  ): Promise<CalendarEvent[]> {
    try {
      const client = this.createOutlookClient(accessToken);

      let query = "/me/calendar/events?$orderby=start/dateTime";

      if (options.startDate) {
        query += `&$filter=start/dateTime ge '${options.startDate.toISOString()}'`;
      }

      if (options.endDate) {
        const filterPrefix = options.startDate ? " and " : "&$filter=";
        query += `${filterPrefix}end/dateTime le '${options.endDate.toISOString()}'`;
      }

      if (options.maxResults) {
        query += `&$top=${options.maxResults}`;
      }

      const response = await client.api(query).get();
      interface OutlookEventResponse {
        id?: string;
        subject?: string;
        body?: { content?: string };
        location?: { displayName?: string };
        start?: { dateTime?: string; timeZone?: string };
        end?: { dateTime?: string; timeZone?: string };
        attendees?: Array<{ emailAddress?: { address?: string }; type?: string }>;
      }

      const events = (response.value || []) as OutlookEventResponse[];
      return events
        .filter((event): event is OutlookEventResponse & { id: string; start: { dateTime: string }; end: { dateTime: string } } => 
          Boolean(event.id && event.start?.dateTime && event.end?.dateTime)
        )
        .map((event) =>
          this.mapOutlookEvent({
            id: event.id,
            subject: event.subject,
            body: event.body,
            location: event.location,
            start: { dateTime: event.start.dateTime },
            end: { dateTime: event.end.dateTime },
            attendees: event.attendees?.map(attendee => ({
              emailAddress: {
                address: attendee.emailAddress?.address || '',
              },
              type: attendee.type || 'required',
            })) || [],
          })
        );
    } catch (error) {
      this.logger.error("Failed to list Outlook events", error);
      throw new Error("Failed to fetch Outlook events");
    }
  }

  private async createOutlookEvent(
    accessToken: string,
    event: Omit<CalendarEvent, "id" | "provider">
  ): Promise<CalendarEvent> {
    try {
      const client = this.createOutlookClient(accessToken);

      const outlookEvent = {
        subject: event.summary,
        body: {
          contentType: "text",
          content: event.description || "",
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: "UTC",
        },
        location: {
          displayName: event.location || "",
        },
        attendees: event.attendees?.map((email) => ({
          emailAddress: { address: email },
          type: "required",
        })),
        reminderMinutesBeforeStart: event.reminders?.[0],
      };

      const response = await client
        .api("/me/calendar/events")
        .post(outlookEvent);

      return this.mapOutlookEvent(response);
    } catch (error) {
      this.logger.error("Failed to create Outlook event", error);
      throw new Error("Failed to create Outlook event");
    }
  }

  private async updateOutlookEvent(
    accessToken: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const client = this.createOutlookClient(accessToken);

      const outlookUpdates: Record<string, unknown> = {};

      if (updates.summary) outlookUpdates.subject = updates.summary;
      if (updates.description) {
        outlookUpdates.body = {
          contentType: "text",
          content: updates.description,
        };
      }
      if (updates.location) {
        outlookUpdates.location = { displayName: updates.location };
      }
      if (updates.start) {
        outlookUpdates.start = {
          dateTime: updates.start.toISOString(),
          timeZone: "UTC",
        };
      }
      if (updates.end) {
        outlookUpdates.end = {
          dateTime: updates.end.toISOString(),
          timeZone: "UTC",
        };
      }
      if (updates.attendees) {
        outlookUpdates.attendees = updates.attendees.map((email: string) => ({
          emailAddress: { address: email },
          type: "required",
        }));
      }

      const response = await client
        .api(`/me/calendar/events/${eventId}`)
        .patch(outlookUpdates);

      return this.mapOutlookEvent(response);
    } catch (error) {
      this.logger.error("Failed to update Outlook event", error);
      throw new Error("Failed to update Outlook event");
    }
  }

  private async deleteOutlookEvent(
    accessToken: string,
    eventId: string
  ): Promise<void> {
    try {
      const client = this.createOutlookClient(accessToken);

      await client.api(`/me/calendar/events/${eventId}`).delete();

      this.logger.log(`Deleted Outlook event: ${eventId}`);
    } catch (error) {
      this.logger.error("Failed to delete Outlook event", error);
      throw new Error("Failed to delete Outlook event");
    }
  }

  private createOutlookClient(accessToken: string) {
    return MicrosoftGraph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  private mapOutlookEvent(event: OutlookEvent): CalendarEvent {
    const emailAddresses = event.attendees
      ?.map((a) => a.emailAddress.address)
      .filter((email): email is string => Boolean(email));

    return {
      id: event.id,
      summary: event.subject || "",
      description: event.body?.content,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      location: event.location?.displayName,
      attendees: emailAddresses,
      reminders: event.reminderMinutesBeforeStart
        ? [event.reminderMinutesBeforeStart]
        : undefined,
      provider: "outlook",
    };
  }
}