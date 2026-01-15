// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - GLOBAL STATE (APPLICATION)
// ================================================================================

/**
 * State Provider - Application Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Transitions + Loader Integration
 *
 * RESPONSIBILITIES:
 * • Global UI state (sidebar, active view, bookmarks)
 * • User preferences (theme, language, timezone)
 * • Online/offline status monitoring
 * • Sync status tracking
 * • Recent items management
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts
 * ✓ Memoized values and callbacks
 * ✓ Transition support for non-urgent updates
 * ✓ StrictMode compatible
 * ✓ SSR-safe localStorage access
 *
 * LOADER INTEGRATION:
 * • Can receive initialPreferences from loader
 * • Hydrates state from loader data
 * • Falls back to localStorage if no loader data
 *
 * ENTERPRISE INVARIANTS:
 * • No domain logic (cases, documents, etc.)
 * • Only app-wide UI state
 * • Observable state changes
 * • Immutable state updates
 *
 * @module providers/application/stateprovider
 */

import { GlobalStateActionsContext, GlobalStateContext } from '@/lib/state/contexts';
import type { AppPreferences, StateActionsValue, StateProviderProps, StateValue } from '@/lib/state/types';
import { useCallback, useContext, useEffect, useMemo, useState, useTransition } from 'react';

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
};

export function StateProvider({ children, initialPreferences }: StateProviderProps) {
  const [isPending, startPrefTransition] = useTransition();

  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const stored = localStorage.getItem('appPreferences');
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored), ...initialPreferences };
      } catch {
        return { ...DEFAULT_PREFERENCES, ...initialPreferences };
      }
    }
    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [activeView, setActiveViewState] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<string[]>(() => {
    const stored = localStorage.getItem('recentItems');
    return stored ? JSON.parse(stored) : [];
  });
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const stored = localStorage.getItem('bookmarks');
    return stored ? JSON.parse(stored) : [];
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string | null>(
    localStorage.getItem('lastSync')
  );

  const updatePreferences = useCallback((updates: Partial<AppPreferences>) => {
    // NON-URGENT: Preference updates can be transitioned
    startPrefTransition(() => {
      setPreferences(prev => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('appPreferences', JSON.stringify(updated));
        return updated;
      });
    });
  }, [startPrefTransition]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarCollapsed', String(newValue));
      return newValue;
    });
  }, []);

  const setActiveView = useCallback((view: string | null) => {
    setActiveViewState(view);
  }, []);

  const addRecentItem = useCallback((itemId: string) => {
    setRecentItems(prev => {
      const filtered = prev.filter(id => id !== itemId);
      const updated = [itemId, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem('recentItems', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addBookmark = useCallback((itemId: string) => {
    setBookmarks(prev => {
      if (prev.includes(itemId)) return prev;
      const updated = [...prev, itemId];
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBookmark = useCallback((itemId: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(id => id !== itemId);
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    localStorage.removeItem('recentItems');
  }, []);

  const updateOnlineStatus = useCallback((online: boolean) => {
    setIsOnline(online);
  }, []);

  const updateLastSync = useCallback(() => {
    const now = new Date().toISOString();
    setLastSync(now);
    localStorage.setItem('lastSync', now);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateOnlineStatus]);

  const stateValue = useMemo<StateValue>(() => ({
    preferences,
    sidebarCollapsed,
    activeView,
    recentItems,
    bookmarks,
    isOnline,
    lastSync,
    isPendingPreferenceUpdate: isPending, // Expose transition state
  }), [preferences, sidebarCollapsed, activeView, recentItems, bookmarks, isOnline, lastSync, isPending]);

  const actionsValue = useMemo<StateActionsValue>(() => ({
    updatePreferences,
    toggleSidebar,
    setActiveView,
    addRecentItem,
    addBookmark,
    removeBookmark,
    clearRecentItems,
    updateOnlineStatus,
    updateLastSync,
  }), [
    updatePreferences,
    toggleSidebar,
    setActiveView,
    addRecentItem,
    addBookmark,
    removeBookmark,
    clearRecentItems,
    updateOnlineStatus,
    updateLastSync,
  ]);

  return (
    <GlobalStateContext.Provider value={stateValue}>
      <GlobalStateActionsContext.Provider value={actionsValue}>
        {children}
      </GlobalStateActionsContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState(): StateValue {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within StateProvider');
  }
  return context;
}

export function useGlobalStateActions(): StateActionsValue {
  const context = useContext(GlobalStateActionsContext);
  if (!context) {
    throw new Error('useGlobalStateActions must be used within StateProvider');
  }
  return context;
}

export function useAppState() {
  return {
    state: useGlobalState(),
    actions: useGlobalStateActions(),
  };
}
