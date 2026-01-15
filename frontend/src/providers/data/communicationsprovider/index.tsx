// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - COMMUNICATIONS DOMAIN
// ================================================================================

/**
 * Communications Provider
 *
 * Manages communications and correspondence data state for client interactions.
 * Handles emails, letters, calls, meetings, and notification management.
 *
 * @module providers/data/communicationsprovider
 */

import { CommunicationsActionsContext, CommunicationsStateContext } from '@/lib/communications/contexts';
import type { CommunicationsActionsValue, CommunicationsProviderProps, CommunicationsStateValue } from '@/lib/communications/types';
import { DataService } from '@/services/data/dataService';
import type { Communication } from '@/types/communications';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function CommunicationsProvider({ children, initialCommunications, caseId }: CommunicationsProviderProps) {
  const [communications, setCommunications] = useState<Communication[]>(initialCommunications || []);
  const [activeCommunicationId, setActiveCommunicationId] = useState<string | null>(null);
  const [activeCommunication, setActiveCommunicationState] = useState<Communication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterByCaseId, _setFilterByCaseId] = useState<string | null>(caseId || null);

  const loadCommunications = useCallback(async (filters?: { caseId?: string; type?: string; isRead?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.communications as unknown as { getAll: (params?: unknown) => Promise<Communication[]> }).getAll(filters);
      setCommunications(loaded.sort((a, b) => {
        const dateA = a.sentAt || a.createdAt || '';
        const dateB = b.sentAt || b.createdAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }));
      setUnreadCount(loaded.filter(c => !c.isRead).length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load communications'));
      console.error('[CommunicationsProvider] Failed to load communications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCommunicationById = useCallback(async (id: string): Promise<Communication | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const communication = await (DataService.communications as unknown as { getById: (id: string) => Promise<Communication> }).getById(id);
      setCommunications(prev => {
        const exists = prev.find(c => c.id === id);
        if (exists) {
          return prev.map(c => c.id === id ? communication : c);
        }
        return [communication, ...prev];
      });
      return communication;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load communication ${id}`));
      console.error('[CommunicationsProvider] Failed to load communication:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCommunication = useCallback(async (data: Partial<Communication>): Promise<Communication> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCommunication = await (DataService.communications as unknown as { add: (data: Partial<Communication>) => Promise<Communication> }).add({
        ...data,
        sentAt: new Date().toISOString(),
        isRead: false,
      });
      setCommunications(prev => [newCommunication, ...prev]);
      setUnreadCount(prev => prev + 1);
      return newCommunication;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create communication'));
      console.error('[CommunicationsProvider] Failed to create communication:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCommunication = useCallback(async (id: string, updates: Partial<Communication>): Promise<Communication> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.communications as unknown as { update: (id: string, data: Partial<Communication>) => Promise<Communication> }).update(id, updates);
      setCommunications(prev => prev.map(c => c.id === id ? updated : c));
      if (activeCommunicationId === id) {
        setActiveCommunicationState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update communication ${id}`));
      console.error('[CommunicationsProvider] Failed to update communication:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCommunicationId]);

  const deleteCommunication = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.communications as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      const deleted = communications.find(c => c.id === id);
      setCommunications(prev => prev.filter(c => c.id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (activeCommunicationId === id) {
        setActiveCommunicationId(null);
        setActiveCommunicationState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete communication ${id}`));
      console.error('[CommunicationsProvider] Failed to delete communication:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCommunicationId, communications]);

  const sendCommunication = useCallback(async (data: Partial<Communication>): Promise<Communication> => {
    return await createCommunication({
      ...data,
      sentAt: new Date().toISOString(),
    });
  }, [createCommunication]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    const comm = communications.find(c => c.id === id);
    if (comm && !comm.isRead) {
      await updateCommunication(id, { isRead: true, readAt: new Date().toISOString() } as Partial<Communication>);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [communications, updateCommunication]);

  const markAsUnread = useCallback(async (id: string): Promise<void> => {
    const comm = communications.find(c => c.id === id);
    if (comm && comm.isRead) {
      await updateCommunication(id, { isRead: false, readAt: undefined } as Partial<Communication>);
      setUnreadCount(prev => prev + 1);
    }
  }, [communications, updateCommunication]);

  const setActiveCommunication = useCallback((id: string | null) => {
    setActiveCommunicationId(id);
    if (id) {
      const found = communications.find(c => c.id === id);
      setActiveCommunicationState(found || null);
      if (!found) {
        loadCommunicationById(id).then(loaded => {
          if (loaded) setActiveCommunicationState(loaded);
        });
      }
      // Auto-mark as read when viewing
      if (found && !found.isRead) {
        markAsRead(id);
      }
    } else {
      setActiveCommunicationState(null);
    }
  }, [communications, loadCommunicationById, markAsRead]);

  const searchCommunications = useCallback(async (query: string): Promise<Communication[]> => {
    if (!query.trim()) return communications;

    const lowerQuery = query.toLowerCase();
    return communications.filter(c =>
      c.subject?.toLowerCase().includes(lowerQuery) ||
      c.body?.toLowerCase().includes(lowerQuery) ||
      c.from?.toLowerCase().includes(lowerQuery) ||
      c.to?.some(recipient => recipient.toLowerCase().includes(lowerQuery))
    );
  }, [communications]);

  const refreshCommunications = useCallback(async () => {
    await loadCommunications(filterByCaseId ? { caseId: filterByCaseId } : {});
  }, [loadCommunications, filterByCaseId]);

  useEffect(() => {
    if (!initialCommunications) {
      loadCommunications(caseId ? { caseId } : {});
    }
  }, [initialCommunications, caseId, loadCommunications]);

  useEffect(() => {
    if (activeCommunicationId) {
      const found = communications.find(c => c.id === activeCommunicationId);
      if (found) {
        setActiveCommunicationState(found);
      }
    }
  }, [activeCommunicationId, communications]);

  const stateValue = useMemo<CommunicationsStateValue>(() => ({
    communications,
    activeCommId: activeCommunicationId,
    activeComm: activeCommunication,
    isLoading,
    error,
    unreadCount,
  }), [communications, activeCommunicationId, activeCommunication, isLoading, error, unreadCount]);

  const actionsValue = useMemo<CommunicationsActionsValue>(() => ({
    loadCommunications,
    loadById: loadCommunicationById,
    sendCommunication,
    markAsRead,
    markAsUnread,
    deleteCommunication,
    setActive: setActiveCommunication,
    searchCommunications,
    refreshCommunications,
  }), [
    loadCommunications,
    loadCommunicationById,
    sendCommunication,
    markAsRead,
    markAsUnread,
    deleteCommunication,
    setActiveCommunication,
    searchCommunications,
    refreshCommunications
  ]);
  return (
    <CommunicationsStateContext.Provider value={stateValue}>
      <CommunicationsActionsContext.Provider value={actionsValue}>
        {children}
      </CommunicationsActionsContext.Provider>
    </CommunicationsStateContext.Provider>
  );
}

export function useCommunicationsState(): CommunicationsStateValue {
  const context = useContext(CommunicationsStateContext);
  if (!context) {
    throw new Error('useCommunicationsState must be used within CommunicationsProvider');
  }
  return context;
}

export function useCommunicationsActions(): CommunicationsActionsValue {
  const context = useContext(CommunicationsActionsContext);
  if (!context) {
    throw new Error('useCommunicationsActions must be used within CommunicationsProvider');
  }
  return context;
}

export function useCommunications() {
  return {
    state: useCommunicationsState(),
    actions: useCommunicationsActions(),
  };
}
