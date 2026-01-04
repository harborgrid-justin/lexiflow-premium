/**
 * Centralized Query Keys for React Query
 *
 * This file defines the query keys used throughout the application for data fetching.
 * Using centralized keys ensures consistency and proper cache invalidation.
 * 
 * @deprecated Use queryKeys from '@/utils/queryKeys' instead.
 */

import { queryKeys } from '@/utils/queryKeys';

export const QUERY_KEYS = {
  TASKS: {
    ALL: queryKeys.tasks.all(),
    BY_ID: (id: string) => queryKeys.tasks.detail(id),
    BY_CASE: (caseId: string) => queryKeys.tasks.byCaseId(caseId),
    COUNT: (caseId: string) => [...queryKeys.tasks.byCaseId(caseId), 'count'],
  },
  CALENDAR: {
    ALL: queryKeys.calendar.events(),
    EVENTS: queryKeys.calendar.events(),
  },
  SANCTIONS: {
    ALL: queryKeys.sanctions.all(),
    BY_CASE: (caseId: string) => queryKeys.sanctions.byCase(caseId),
  },
  EXHIBITS: {
    ALL: queryKeys.exhibits.all(),
    BY_CASE: (caseId: string) => queryKeys.exhibits.byCaseId(caseId),
  },
  WITNESSES: {
    ALL: queryKeys.witnesses.all(),
    BY_CASE: (caseId: string) => queryKeys.witnesses.byCase(caseId),
  },
  USERS: {
    ALL: queryKeys.users.all(),
    PROFILE: (id: string) => [...queryKeys.users.detail(id), 'profile'],
  },
  ASSETS: {
    ALL: queryKeys.assets.all(),
    BY_ID: (id: string) => queryKeys.assets.detail(id),
  },
  DOCUMENTS: {
    ALL: queryKeys.documents.all(),
    BY_CASE: (caseId: string) => queryKeys.documents.byCaseId(caseId),
  },
  CASES: {
    ALL: queryKeys.cases.all(),
    WAR_ROOM: (id: string) => queryKeys.warRoom.data(id),
  },
  DEPOSITIONS: {
    ALL: queryKeys.depositions.all(),
  },
  REQUESTS: {
    ALL: queryKeys.discovery.all(),
    BY_CASE: (caseId: string) => queryKeys.discovery.byCaseId(caseId),
  },
  CLIENTS: {
    ALL: queryKeys.clients.all(),
  },
  CRM: {
    LEADS: queryKeys.crm.leads(),
    OPPORTUNITIES: queryKeys.crm.opportunities(),
    RELATIONSHIPS: queryKeys.crm.relationships(),
  },
  CLAUSES: {
    ALL: queryKeys.clauses.all(),
  },
  MESSAGES: {
    UNREAD_COUNT: (caseId: string) => queryKeys.messages.unreadCount(caseId),
  },
  BILLING: {
    INVOICES: queryKeys.billing.invoices(),
  },
  WEBHOOKS: {
    ALL: queryKeys.webhooks.all(),
  },
  VERSION_CONTROL: {
    HISTORY: queryKeys.versionControl.history(),
    BRANCHES: queryKeys.versionControl.branches(),
    TAGS: queryKeys.versionControl.tags(),
  },
  REALTIME: {
    STREAMS: queryKeys.realtime.streams(),
  },
  DB: {
    INFO: queryKeys.db.info(),
  },
  EVENT_BUS: {
    EVENTS: queryKeys.eventBus.events(),
  },
  SYSTEM: {
    CONFIG: queryKeys.system.config(),
  },
};
