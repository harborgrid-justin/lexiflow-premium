/**
 * AppStateContext.tsx
 * Global application state management with reducer pattern
 * Handles complex state transitions and side effects
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'client';
  permissions: string[];
}

export interface AppSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  settings: AppSettings;
  isLoading: boolean;
  error: Error | null;
  notifications: Notification[];
  lastSync: Date | null;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  activeModule: string | null;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'online' | 'offline' | 'reconnecting' }
  | { type: 'SET_ACTIVE_MODULE'; payload: string | null }
  | { type: 'RESET_STATE' };

// Context Type
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User | null) => void;
    login: (user: User) => void;
    logout: () => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    setConnectionStatus: (status: 'online' | 'offline' | 'reconnecting') => void;
    setActiveModule: (module: string | null) => void;
  };
}

// ============================================================================
// Initial State
// ============================================================================

const initialSettings: AppSettings = {
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  autoSave: true,
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
};

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  settings: initialSettings,
  isLoading: false,
  error: null,
  notifications: [],
  lastSync: null,
  connectionStatus: 'online',
  activeModule: null,
};

// ============================================================================
// Reducer
// ============================================================================

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Keep last 50
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload,
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case 'SET_ACTIVE_MODULE':
      return {
        ...state,
        activeModule: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Context Creation
// ============================================================================

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface AppStateProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
  initialState: customInitialState,
}) => {
  const [state, dispatch] = useReducer(
    appStateReducer,
    { ...initialState, ...customInitialState }
  );

  // Action creators
  const actions = {
    setUser: useCallback((user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    }, []),

    login: useCallback((user: User) => {
      dispatch({ type: 'SET_USER', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
    }, []),

    logout: useCallback(() => {
      dispatch({ type: 'SET_USER', payload: null });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }, []),

    updateSettings: useCallback((settings: Partial<AppSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }, []),

    addNotification: useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    }, []),

    removeNotification: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []),

    markNotificationRead: useCallback((id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    }, []),

    clearNotifications: useCallback(() => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }, []),

    setConnectionStatus: useCallback((status: 'online' | 'offline' | 'reconnecting') => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    }, []),

    setActiveModule: useCallback((module: string | null) => {
      dispatch({ type: 'SET_ACTIVE_MODULE', payload: module });
    }, []),
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => actions.setConnectionStatus('online');
    const handleOffline = () => actions.setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actions]);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppStateContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export default AppStateContext;
