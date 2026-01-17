/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages & Communication Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { communicationsApi } from "@/lib/frontend-api";

type CommunicationMessage = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  caseId?: string;
};

export interface MessagesLoaderData {
  messages: CommunicationMessage[];
  unreadCount: number;
}

export async function messagesLoader() {
  const result = await communicationsApi.getAllMessages({
    page: 1,
    limit: 100,
  });
  const messages: CommunicationMessage[] = result.ok
    ? (result.data.data as CommunicationMessage[])
    : [];
  const unreadCount = messages.filter(
    (m: CommunicationMessage) => !m.read,
  ).length;

  return {
    messages: messages || [],
    unreadCount,
  };
}
