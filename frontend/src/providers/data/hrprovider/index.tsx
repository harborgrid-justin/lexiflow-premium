// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - HR DOMAIN
// ================================================================================

/**
 * HR Provider
 *
 * Manages HR and staff management data state for firm operations.
 * Handles user management, case team assignments, role administration.
 *
 * @module providers/data/hrprovider
 */

import { HRActionsContext, HRStateContext } from '@/lib/hr/contexts';
import type { HRActionsValue, HRProviderProps, HRStateValue } from '@/lib/hr/types';
import { DataService } from '@/services/data/dataService';
import type { CaseTeamMember } from '@/types/case-team';
import type { User } from '@/types/system';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface CaseTeam {
  caseId: string;
  members: CaseTeamMember[];
}

export function HRProvider({ children, initialUsers }: HRProviderProps) {
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [caseTeams, setCaseTeams] = useState<CaseTeam[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeUser, setActiveUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // User Management
  const loadUsers = useCallback(async (filters?: { role?: string; department?: string; active?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.hr as unknown as { getUsers: (params?: unknown) => Promise<User[]> }).getUsers(filters);
      setUsers(loaded.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load users'));
      console.error('[HRProvider] Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserById = useCallback(async (id: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await (DataService.hr as unknown as { getUserById: (id: string) => Promise<User> }).getUserById(id);
      setUsers(prev => {
        const exists = prev.find(u => u.id === id);
        if (exists) {
          return prev.map(u => u.id === id ? user : u);
        }
        return [...prev, user];
      });
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load user ${id}`));
      console.error('[HRProvider] Failed to load user:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await (DataService.hr as unknown as { addUser: (data: Partial<User>) => Promise<User> }).addUser(data);
      setUsers(prev => [...prev, newUser].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create user'));
      console.error('[HRProvider] Failed to create user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.hr as unknown as { updateUser: (id: string, data: Partial<User>) => Promise<User> }).updateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      if (activeUserId === id) {
        setActiveUserState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update user ${id}`));
      console.error('[HRProvider] Failed to update user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.hr as unknown as { deleteUser: (id: string) => Promise<void> }).deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (activeUserId === id) {
        setActiveUserId(null);
        setActiveUserState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete user ${id}`));
      console.error('[HRProvider] Failed to delete user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  const deactivateUser = useCallback(async (id: string): Promise<void> => {
    await updateUser(id, { isActive: false } as Partial<User>);
  }, [updateUser]);

  const activateUser = useCallback(async (id: string): Promise<void> => {
    await updateUser(id, { isActive: true } as Partial<User>);
  }, [updateUser]);

  // Case Team Management
  const loadCaseTeam = useCallback(async (caseId: string): Promise<CaseTeamMember[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const members = await (DataService.hr as unknown as { getCaseTeam: (caseId: string) => Promise<CaseTeamMember[]> }).getCaseTeam(caseId);
      setCaseTeams(prev => {
        const existing = prev.find(t => t.caseId === caseId);
        if (existing) {
          return prev.map(t => t.caseId === caseId ? { caseId, members } : t);
        }
        return [...prev, { caseId, members }];
      });
      return members;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load case team for ${caseId}`));
      console.error('[HRProvider] Failed to load case team:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignToCaseTeam = useCallback(async (
    caseId: string,
    userId: string,
    role: string
  ): Promise<CaseTeamMember> => {
    setIsLoading(true);
    setError(null);
    try {
      const member = await (DataService.hr as unknown as { assignToCaseTeam: (caseId: string, userId: string, role: string) => Promise<CaseTeamMember> }).assignToCaseTeam(caseId, userId, role);
      setCaseTeams(prev => {
        const team = prev.find(t => t.caseId === caseId);
        if (team) {
          return prev.map(t =>
            t.caseId === caseId
              ? { ...t, members: [...t.members, member] }
              : t
          );
        }
        return [...prev, { caseId, members: [member] }];
      });
      return member;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to assign user ${userId} to case ${caseId}`));
      console.error('[HRProvider] Failed to assign to case team:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromCaseTeam = useCallback(async (caseId: string, userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.hr as unknown as { removeFromCaseTeam: (caseId: string, userId: string) => Promise<void> }).removeFromCaseTeam(caseId, userId);
      setCaseTeams(prev =>
        prev.map(t =>
          t.caseId === caseId
            ? { ...t, members: t.members.filter(m => m.userId !== userId) }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to remove user ${userId} from case ${caseId}`));
      console.error('[HRProvider] Failed to remove from case team:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCaseTeamRole = useCallback(async (
    caseId: string,
    userId: string,
    newRole: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.hr as unknown as { updateCaseTeamRole: (caseId: string, userId: string, role: string) => Promise<void> }).updateCaseTeamRole(caseId, userId, newRole);
      setCaseTeams(prev =>
        prev.map(t =>
          t.caseId === caseId
            ? {
              ...t,
              members: t.members.map(m =>
                m.userId === userId
                  ? { ...m, role: newRole as CaseTeamMember['role'] }
                  : m
              )
            }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update role for user ${userId} in case ${caseId}`));
      console.error('[HRProvider] Failed to update case team role:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveUser = useCallback((id: string | null) => {
    setActiveUserId(id);
    if (id) {
      const found = users.find(u => u.id === id);
      setActiveUserState(found || null);
      if (!found) {
        loadUserById(id).then(loaded => {
          if (loaded) setActiveUserState(loaded);
        });
      }
    } else {
      setActiveUserState(null);
    }
  }, [users, loadUserById]);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    if (!query.trim()) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(lowerQuery) ||
      u.email?.toLowerCase().includes(lowerQuery) ||
      u.role?.toLowerCase().includes(lowerQuery) ||
      u.department?.toLowerCase().includes(lowerQuery)
    );
  }, [users]);

  const refreshUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!initialUsers) {
      loadUsers();
    }
  }, [initialUsers, loadUsers]);

  useEffect(() => {
    if (activeUserId) {
      const found = users.find(u => u.id === activeUserId);
      if (found) {
        setActiveUserState(found);
      }
    }
  }, [activeUserId, users]);

  const stateValue = useMemo<HRStateValue>(() => ({
    users,
    caseTeams,
    activeUserId,
    activeUser,
    isLoading,
    error,
  }), [users, caseTeams, activeUserId, activeUser, isLoading, error]);

  const actionsValue = useMemo<HRActionsValue>(() => ({
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    loadCaseTeam,
    assignToCaseTeam,
    removeFromCaseTeam,
    updateCaseTeamRole,
    setActiveUser,
    searchUsers,
    refreshUsers,
  }), [
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    loadCaseTeam,
    assignToCaseTeam,
    removeFromCaseTeam,
    updateCaseTeamRole,
    setActiveUser,
    searchUsers,
    refreshUsers
  ]);

  return (
    <HRStateContext.Provider value={stateValue}>
      <HRActionsContext.Provider value={actionsValue}>
        {children}
      </HRActionsContext.Provider>
    </HRStateContext.Provider>
  );
}

export function useHRState(): HRStateValue {
  const context = useContext(HRStateContext);
  if (!context) {
    throw new Error('useHRState must be used within HRProvider');
  }
  return context;
}

export function useHRActions(): HRActionsValue {
  const context = useContext(HRActionsContext);
  if (!context) {
    throw new Error('useHRActions must be used within HRProvider');
  }
  return context;
}

export function useHR() {
  return {
    state: useHRState(),
    actions: useHRActions(),
  };
}
