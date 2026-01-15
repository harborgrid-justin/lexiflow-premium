/**
 * Clients Provider Types
 * Type definitions for client management context
 *
 * @module lib/clients/types
 */

import type { Client } from "@/types/financial";

export interface ClientsStateValue {
  clients: Client[];
  activeClientId: string | null;
  activeClient: Client | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ClientsActionsValue {
  loadClients: () => Promise<void>;
  loadClientById: (id: string) => Promise<Client | null>;
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setActiveClient: (id: string | null) => void;
  searchClients: (query: string) => Promise<Client[]>;
  refreshClients: () => Promise<void>;
}

export interface ClientsProviderProps {
  children: React.ReactNode;
  initialClients?: Client[];
}
