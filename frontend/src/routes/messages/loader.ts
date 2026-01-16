/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages & Communication Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { communicationsApi } from "@/lib/frontend-api";

type Message = {
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
  messages: Message[];
  unreadCount: number;
}

export async function messagesLoader() {
  const result = await communicationsApi.getAllMessages({
    page: 1,
    limit: 100,
  });
  const messages = result.ok ? result.data.data : [];
  const unreadCount = messages.filter((m: Message) => !m.read).length;

  return {
    messages: messages || [],
    unreadCount,
  };
}
