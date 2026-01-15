/**
 * Communications Provider Types
 * Type definitions for communications management context
 *
 * @module lib/communications/types
 */

import type { Communication } from "@/types/communications";

export interface CommunicationsStateValue {
  communications: Communication[];
  activeCommId: string | null;
  activeComm: Communication | null;
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
}

export interface CommunicationsActionsValue {
  loadCommunications: (filters?: {
    caseId?: string;
    type?: string;
  }) => Promise<void>;
  loadById: (id: string) => Promise<Communication | null>;
  sendCommunication: (data: Partial<Communication>) => Promise<Communication>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  deleteCommunication: (id: string) => Promise<void>;
  setActive: (id: string | null) => void;
  searchCommunications: (query: string) => Promise<Communication[]>;
  refreshCommunications: () => Promise<void>;
}

export interface CommunicationsProviderProps {
  children: React.ReactNode;
  initialCommunications?: Communication[];
  caseId?: string;
}
