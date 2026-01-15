// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - CLIENTS DOMAIN
// ================================================================================

/**
 * Clients Provider
 *
 * Manages client data state and operations for CRM and relationship management.
 * Handles client CRUD, search, contact management, and client-case associations.
 *
 * @module providers/data/clientsprovider
 */

import { ClientsActionsContext, ClientsStateContext } from '@/lib/clients/contexts';
import type { ClientsActionsValue, ClientsProviderProps, ClientsStateValue } from '@/lib/clients/types';
import { DataService } from '@/services/data/dataService';
import type { Client } from '@/types/financial';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function ClientsProvider({ children, initialClients }: ClientsProviderProps) {
  const [clients, setClients] = useState<Client[]>(initialClients || []);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeClient, setActiveClientState] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.clients as unknown as { getAll: () => Promise<Client[]> }).getAll();
      setClients(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load clients'));
      console.error('[ClientsProvider] Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClientById = useCallback(async (id: string): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await (DataService.clients as unknown as { getById: (id: string) => Promise<Client> }).getById(id);
      setClients(prev => {
        const exists = prev.find(c => c.id === id);
        if (exists) {
          return prev.map(c => c.id === id ? client : c);
        }
        return [...prev, client];
      });
      return client;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load client ${id}`));
      console.error('[ClientsProvider] Failed to load client:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClient = useCallback(async (data: Partial<Client>): Promise<Client> => {
    setIsLoading(true);
    setError(null);
    try {
      const newClient = await (DataService.clients as unknown as { add: (data: Partial<Client>) => Promise<Client> }).add(data);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create client'));
      console.error('[ClientsProvider] Failed to create client:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>): Promise<Client> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.clients as unknown as { update: (id: string, data: Partial<Client>) => Promise<Client> }).update(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      if (activeClientId === id) {
        setActiveClientState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update client ${id}`));
      console.error('[ClientsProvider] Failed to update client:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeClientId]);

  const deleteClient = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.clients as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      if (activeClientId === id) {
        setActiveClientId(null);
        setActiveClientState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete client ${id}`));
      console.error('[ClientsProvider] Failed to delete client:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeClientId]);

  const setActiveClient = useCallback((id: string | null) => {
    setActiveClientId(id);
    if (id) {
      const found = clients.find(c => c.id === id);
      setActiveClientState(found || null);
      if (!found) {
        loadClientById(id).then(loaded => {
          if (loaded) setActiveClientState(loaded);
        });
      }
    } else {
      setActiveClientState(null);
    }
  }, [clients, loadClientById]);

  const searchClients = useCallback(async (query: string): Promise<Client[]> => {
    if (!query.trim()) return clients;

    const lowerQuery = query.toLowerCase();
    return clients.filter(c =>
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.toLowerCase().includes(lowerQuery) ||
      c.industry?.toLowerCase().includes(lowerQuery)
    );
  }, [clients]);

  const refreshClients = useCallback(async () => {
    await loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!initialClients) {
      loadClients();
    }
  }, [initialClients, loadClients]);

  useEffect(() => {
    if (activeClientId) {
      const found = clients.find(c => c.id === activeClientId);
      if (found) {
        setActiveClientState(found);
      }
    }
  }, [activeClientId, clients]);

  const stateValue = useMemo<ClientsStateValue>(() => ({
    clients,
    activeClientId,
    activeClient,
    isLoading,
    error,
  }), [clients, activeClientId, activeClient, isLoading, error]);

  const actionsValue = useMemo<ClientsActionsValue>(() => ({
    loadClients,
    loadClientById,
    createClient,
    updateClient,
    deleteClient,
    setActiveClient,
    searchClients,
    refreshClients,
  }), [loadClients, loadClientById, createClient, updateClient, deleteClient, setActiveClient, searchClients, refreshClients]);

  return (
    <ClientsStateContext.Provider value={stateValue}>
      <ClientsActionsContext.Provider value={actionsValue}>
        {children}
      </ClientsActionsContext.Provider>
    </ClientsStateContext.Provider>
  );
}

export function useClientsState(): ClientsStateValue {
  const context = useContext(ClientsStateContext);
  if (!context) {
    throw new Error('useClientsState must be used within ClientsProvider');
  }
  return context;
}

export function useClientsActions(): ClientsActionsValue {
  const context = useContext(ClientsActionsContext);
  if (!context) {
    throw new Error('useClientsActions must be used within ClientsProvider');
  }
  return context;
}

export function useClients() {
  return {
    state: useClientsState(),
    actions: useClientsActions(),
  };
}
