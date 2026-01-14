// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - AUTH DOMAIN
// ================================================================================
//
// CANONICAL STRUCTURE:
// ├── Types
// ├── State Shape
// ├── Actions (Action Types)
// ├── Reducer
// ├── Selectors
// ├── Context
// ├── Provider
// └── Public Hook
//
// POSITION IN ARCHITECTURE:
//   Frontend API (truth) → Loader/Actions (orchestration) → Context (state) → Views
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (auth)
//   ✓ No direct HTTP calls (uses AuthService)
//   ✓ No router navigation
//   ✓ No JSX layout (only provider wrapper)
//   ✓ Loader-based initialization
//   ✓ Optimistic state support
//   ✓ Memoized selectors
//   ✓ Immutable context values
//
// ================================================================================

import { AuthService } from "@/services/domain/auth.service";
import type { User } from "@/types";
import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

// ================================================================================
// Types
// ================================================================================

export type AuthStatus = "anonymous" | "authenticated";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  optimistic: {
    loggingIn: boolean;
    loggingOut: boolean;
  };
}

type AuthAction =
  | { type: "auth/loginStart"; payload: { email: string } }
  | { type: "auth/loginSuccess"; payload: { user: User } }
  | { type: "auth/loginFailure"; payload: { error: string } }
  | { type: "auth/logoutStart" }
  | { type: "auth/logoutSuccess" }
  | { type: "auth/initialize"; payload: { user: User | null } }
  | { type: "auth/clearError" }
  | { type: "auth/setLoading"; payload: boolean };

// ================================================================================
// State Shape
// ================================================================================

const initialState: AuthState = {
  status: "anonymous",
  user: null,
  isLoading: true,
  error: null,
  optimistic: {
    loggingIn: false,
    loggingOut: false,
  },
};

// ================================================================================
// Reducer
// ================================================================================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "auth/loginStart":
      return {
        ...state,
        isLoading: true,
        error: null,
        optimistic: { ...state.optimistic, loggingIn: true },
      };

    case "auth/loginSuccess":
      return {
        ...state,
        status: "authenticated",
        user: action.payload.user,
        isLoading: false,
        error: null,
        optimistic: { ...state.optimistic, loggingIn: false },
      };

    case "auth/loginFailure":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        optimistic: { ...state.optimistic, loggingIn: false },
      };

    case "auth/logoutStart":
      return {
        ...state,
        optimistic: { ...state.optimistic, loggingOut: true },
      };

    case "auth/logoutSuccess":
      return {
        ...initialState,
        isLoading: false,
      };

    case "auth/initialize":
      return {
        ...state,
        status: action.payload.user ? "authenticated" : "anonymous",
        user: action.payload.user,
        isLoading: false,
      };

    case "auth/clearError":
      return {
        ...state,
        error: null,
      };

    case "auth/setLoading":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// ================================================================================
// Selectors (Memoized derivations)
// ================================================================================

interface AuthSelectors {
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  userName: string | null;
  userEmail: string | null;
}

function createSelectors(state: AuthState): AuthSelectors {
  return {
    isAuthenticated: state.status === "authenticated" && state.user !== null,
    canAccessAdmin: state.user?.role === "Administrator" || false,
    userName: state.user?.firstName
      ? `${state.user.firstName} ${state.user.lastName}`.trim()
      : state.user?.email || null,
    userEmail: state.user?.email || null,
  };
}

// ================================================================================
// Context
// ================================================================================

interface AuthStateValue extends AuthState {
  selectors: AuthSelectors;
}

interface AuthActionsValue {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: (user: User | null) => void;
  clearError: () => void;
}

const AuthStateContext = createContext<AuthStateValue | null>(null);
const AuthActionsContext = createContext<AuthActionsValue | null>(null);

// ================================================================================
// Provider
// ================================================================================

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null; // Loader-based initialization
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize from loader data on mount
  React.useEffect(() => {
    if (initialUser !== undefined) {
      dispatch({ type: "auth/initialize", payload: { user: initialUser } });
    } else {
      // Fallback to service initialization
      AuthService.initializeFromStorage().then((user) => {
        dispatch({ type: "auth/initialize", payload: { user } });
      });
    }
  }, [initialUser]);

  // Memoized selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Domain actions (call service layer, not HTTP directly)
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "auth/loginStart", payload: { email } });
    try {
      const user = await AuthService.login(email, password);
      dispatch({ type: "auth/loginSuccess", payload: { user } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      dispatch({ type: "auth/loginFailure", payload: { error: message } });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: "auth/logoutStart" });
    try {
      await AuthService.logout();
      dispatch({ type: "auth/logoutSuccess" });
    } catch (err) {
      console.error("Logout failed", err);
      // Force logout even on error
      dispatch({ type: "auth/logoutSuccess" });
    }
  }, []);

  const initialize = useCallback((user: User | null) => {
    dispatch({ type: "auth/initialize", payload: { user } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "auth/clearError" });
  }, []);

  // Immutable context values
  const stateValue = useMemo<AuthStateValue>(
    () => ({
      ...state,
      selectors,
    }),
    [state, selectors]
  );

  const actionsValue = useMemo<AuthActionsValue>(
    () => ({
      login,
      logout,
      initialize,
      clearError,
    }),
    [login, logout, initialize, clearError]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// ================================================================================
// Public Hooks
// ================================================================================

export function useAuthState(): AuthStateValue {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }
  return context;
}

export function useAuthActions(): AuthActionsValue {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }
  return context;
}

export function useAuth() {
  return {
    ...useAuthState(),
    ...useAuthActions(),
  };
}
