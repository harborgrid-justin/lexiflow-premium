/**
 * Messages & Communication Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

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

export async function messagesLoader(): Promise<MessagesLoaderData> {
  const messages = await DataService.messages.getAll().catch(() => []);
  const unreadCount = messages.filter((m: Message) => !m.read).length;

  return {
    messages: messages || [],
    unreadCount,
  };
}
