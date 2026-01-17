/**
 * ================================================================================
 * USER PROVIDER - APPLICATION LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Loader Integration + Permissions
 *
 * RESPONSIBILITIES:
 * • Current user profile management
 * • User permissions and roles
 * • Loader-based initialization
 * • LocalStorage fallback (SSR-safe)
 * • Profile updates
 *
 * REACT 18 PATTERNS:
 * ✓ Loader-first initialization
 * ✓ Split state/actions contexts
 * ✓ Memoized context values
 * ✓ SSR-safe localStorage access
 * ✓ StrictMode compatible
 *
 * DATA FLOW:
 * SERVER → LOADER → USER PROVIDER → COMPONENT VIEWS
 *
 * @module providers/application/userprovider
 */

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { UserActionsContext, UserStateContext } from '@/lib/user/contexts';
import { DataService } from '@/services/data/dataService';

import type { UserActionsValue, UserProfile, UserProviderProps, UserStateValue } from '@/lib/user/types';

interface EnhancedUserProviderProps extends Omit<UserProviderProps, 'initialUser'> {
  /**
   * Initial user data from loader (ENTERPRISE STANDARD)
   * LOADER-FIRST DATA FLOW: Server → Loader → Provider → View
   */
  initialUser?: unknown;
}

export function UserProvider({ children, autoLoad = true, initialUser }: EnhancedUserProviderProps) {
  // LOADER-FIRST INITIALIZATION (Enterprise Standard)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (initialUser) {
      return initialUser as UserProfile;
    }
    // Fallback to localStorage (SSR-safe)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lexiflow-current-user');
        if (stored) {
          return JSON.parse(stored) as UserProfile;
        }
      } catch (err) {
        console.error('[UserProvider] Failed to parse stored user:', err);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [permissions, setPermissions] = useState<string[]>(() => {
    const user = initialUser as UserProfile | undefined;
    if (user?.preferences?.permissions) {
      return user.preferences.permissions as string[];
    }
    return [];
  });

  const [roles, setRoles] = useState<string[]>(() => {
    const user = initialUser as UserProfile | undefined;
    if (user?.role) {
      return [user.role];
    }
    return [];
  });

  const loadCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In production, this would fetch from the API
      const stored = localStorage.getItem('lexiflow-current-user');
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        setCurrentUser(user);
        // Extract permissions from user object if available
        const userPerms = user.preferences?.permissions as string[] | undefined;
        setPermissions(userPerms || []);
        setRoles([user.role || 'user']);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user'));
      console.error('[UserProvider] Failed to load current user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No current user');

    setIsLoading(true);
    setError(null);
    try {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem('lexiflow-current-user', JSON.stringify(updated));

      // In production, update via API
      await (DataService.hr as unknown as { updateUser: (id: string, data: Partial<UserProfile>) => Promise<UserProfile> }).updateUser(currentUser.id, updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      console.error('[UserProvider] Failed to update profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('No current user');

    setIsLoading(true);
    setError(null);
    try {
      // In production, upload to storage service
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateProfile({ avatar: dataUrl });
      return dataUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload avatar'));
      console.error('[UserProvider] Failed to upload avatar:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, updateProfile]);

  const clearUser = useCallback(() => {
    setCurrentUser(null);
    setPermissions([]);
    setRoles([]);
    localStorage.removeItem('lexiflow-current-user');
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    try {
      // In production, fetch from API
      const stored = localStorage.getItem('lexiflow-current-user');
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        const userPerms = user.preferences?.permissions as string[] | undefined;
        setPermissions(userPerms || []);
        setRoles([user.role || 'user']);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh permissions'));
      console.error('[UserProvider] Failed to refresh permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (autoLoad) {
      loadCurrentUser();
    }
  }, [autoLoad, loadCurrentUser]);

  const stateValue = useMemo<UserStateValue>(() => ({
    currentUser,
    isLoading,
    error,
    permissions,
    roles,
  }), [currentUser, isLoading, error, permissions, roles]);

  const actionsValue = useMemo<UserActionsValue>(() => ({
    loadCurrentUser,
    updateProfile,
    uploadAvatar,
    clearUser,
    refreshPermissions,
  }), [loadCurrentUser, updateProfile, uploadAvatar, clearUser, refreshPermissions]);

  return (
    <UserStateContext.Provider value={stateValue}>
      <UserActionsContext.Provider value={actionsValue}>
        {children}
      </UserActionsContext.Provider>
    </UserStateContext.Provider>
  );
}

export function useUserState(): UserStateValue {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState must be used within UserProvider');
  }
  return context;
}

export function useUserActions(): UserActionsValue {
  const context = useContext(UserActionsContext);
  if (!context) {
    throw new Error('useUserActions must be used within UserProvider');
  }
  return context;
}

export function useCurrentUser() {
  return {
    state: useUserState(),
    actions: useUserActions(),
  };
}
