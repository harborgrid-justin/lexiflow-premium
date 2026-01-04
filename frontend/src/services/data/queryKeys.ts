/**
 * Centralized Query Keys for React Query
 *
 * This file defines the query keys used throughout the application for data fetching.
 * Using centralized keys ensures consistency and proper cache invalidation.
 */

export const QUERY_KEYS = {
  TASKS: {
    ALL: ["tasks"],
    BY_ID: (id: string) => ["tasks", id],
    BY_CASE: (caseId: string) => ["tasks", "case", caseId],
    COUNT: (caseId: string) => ["tasks", caseId, "count"],
  },
  CALENDAR: {
    ALL: ["calendar"],
    EVENTS: ["calendar", "events"],
  },
  SANCTIONS: {
    ALL: ["sanctions"],
    BY_CASE: (caseId: string) => ["sanctions", "case", caseId],
  },
  EXHIBITS: {
    ALL: ["exhibits"],
    BY_CASE: (caseId: string) => ["exhibits", "case", caseId],
  },
  WITNESSES: {
    ALL: ["witnesses"],
    BY_CASE: (caseId: string) => ["witnesses", "case", caseId],
  },
  USERS: {
    ALL: ["users"],
    PROFILE: (id: string) => ["users", id, "profile"],
  },
  ASSETS: {
    ALL: ["assets"],
    BY_ID: (id: string) => ["assets", id],
  },
  DOCUMENTS: {
    ALL: ["documents"],
    BY_CASE: (caseId: string) => ["documents", "case", caseId],
  },
  CASES: {
    ALL: ["cases"],
    WAR_ROOM: (id: string) => ["cases", id, "warRoom"],
  },
  DEPOSITIONS: {
    ALL: ["depositions"],
  },
  REQUESTS: {
    ALL: ["requests"],
    BY_CASE: (caseId: string) => ["requests", "case", caseId],
  },
  CLIENTS: {
    ALL: ["clients"],
  },
  CRM: {
    LEADS: ["crm", "leads"],
    OPPORTUNITIES: ["crm", "opportunities"],
    RELATIONSHIPS: ["crm", "relationships"],
  },
  CLAUSES: {
    ALL: ["clauses"],
  },
  MESSAGES: {
    UNREAD_COUNT: (caseId: string) => ["messages", caseId, "count"],
  },
  BILLING: {
    INVOICES: ["billing", "invoices"],
  },
  WEBHOOKS: {
    ALL: ["webhooks"],
  },
  VERSION_CONTROL: {
    HISTORY: ["versionControl", "history"],
    BRANCHES: ["versionControl", "branches"],
    TAGS: ["versionControl", "tags"],
  },
  REALTIME: {
    STREAMS: ["realtime", "streams"],
  },
  DB: {
    INFO: ["db", "info"],
  },
  EVENT_BUS: {
    EVENTS: ["eventBus", "events"],
  },
  SYSTEM: {
    CONFIG: ["system", "config"],
  },
};
