// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - ENTITLEMENTS DOMAIN
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
//   ✓ Domain-scoped state only (entitlements)
//   ✓ No direct HTTP calls (uses EntitlementsService)
//   ✓ No router navigation
//   ✓ No JSX layout (only provider wrapper)
//   ✓ Loader-based initialization
//   ✓ Memoized selectors
//   ✓ Immutable context values
//   ✓ Concurrent-safe with useTransition
//
// ================================================================================

import { EntitlementsService } from "@/services/domain/entitlements.service";
import type { User } from "@/types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useTransition } from "react";

// ================================================================================
// Types
// ================================================================================

export type Plan = "free" | "pro" | "enterprise";

export interface Entitlements {
  plan: Plan;
  canUseAdminTools: boolean;
  maxCases: number;
  storageLimitGB: number;
}

interface EntitlementsState {
  entitlements: Entitlements;
  isLoading: boolean;
  error: string | null;
}

type EntitlementsAction =
  | { type: "entitlements/fetchStart" }
  | { type: "entitlements/fetchSuccess"; payload: Entitlements }
  | { type: "entitlements/fetchFailure"; payload: { error: string } }
  | { type: "entitlements/reset" };

// ================================================================================
// State Shape
// ================================================================================

const DEFAULT_ENTITLEMENTS: Entitlements = {
  plan: "free",
  canUseAdminTools: false,
  maxCases: 5,
  storageLimitGB: 1,
};

const initialState: EntitlementsState = {
  entitlements: DEFAULT_ENTITLEMENTS,
  isLoading: false,
  error: null,
};

// ================================================================================
// Reducer
// ================================================================================

function entitlementsReducer(
  state: EntitlementsState,
  action: EntitlementsAction
): EntitlementsState {
  switch (action.type) {
    case "entitlements/fetchStart":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "entitlements/fetchSuccess":
      return {
        ...state,
        entitlements: action.payload,
        isLoading: false,
        error: null,
      };

    case "entitlements/fetchFailure":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case "entitlements/reset":
      return initialState;

    default:
      return state;
  }
}

// ================================================================================
// Selectors (Memoized derivations)
// ================================================================================

interface EntitlementsSelectors {
  isFreePlan: boolean;
  isProPlan: boolean;
  isEnterprisePlan: boolean;
  canCreateMoreCases: (currentCount: number) => boolean;
  hasAdminAccess: boolean;
}

function createSelectors(state: EntitlementsState): EntitlementsSelectors {
  const { entitlements } = state;

  return {
    isFreePlan: entitlements.plan === "free",
    isProPlan: entitlements.plan === "pro",
    isEnterprisePlan: entitlements.plan === "enterprise",
    canCreateMoreCases: (currentCount: number) =>
      currentCount < entitlements.maxCases,
    hasAdminAccess: entitlements.canUseAdminTools,
  };
}

// ================================================================================
// Context
// ================================================================================

interface EntitlementsStateValue extends EntitlementsState {
  selectors: EntitlementsSelectors;
  isPending: boolean; // React 18 transition state
}

interface EntitlementsActionsValue {
  refresh: (user: User | null) => Promise<void>;
  reset: () => void;
}

const EntitlementsStateContext = createContext<EntitlementsStateValue | null>(null);
const EntitlementsActionsContext = createContext<EntitlementsActionsValue | null>(null);

// ================================================================================
// Provider
// ================================================================================

export interface EntitlementsProviderProps {
  children: React.ReactNode;
  initialUser?: User | null; // Derived from auth context
}

export function EntitlementsProvider({ children, initialUser }: EntitlementsProviderProps) {
  const [state, dispatch] = useReducer(entitlementsReducer, initialState);
  const [isPending, startTransition] = useTransition();

  // Derive entitlements when user changes
  useEffect(() => {
    if (!initialUser) {
      dispatch({ type: "entitlements/reset" });
      return;
    }

    const fetchEntitlements = async () => {
      dispatch({ type: "entitlements/fetchStart" });
      try {
        const entitlements = await EntitlementsService.deriveFromUser(initialUser);

        // Use transition for non-urgent updates
        startTransition(() => {
          dispatch({
            type: "entitlements/fetchSuccess",
            payload: entitlements,
          });
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch entitlements";
        dispatch({
          type: "entitlements/fetchFailure",
          payload: { error: message },
        });
      }
    };

    fetchEntitlements();
  }, [initialUser]);

  // Memoized selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Domain actions
  const refresh = useCallback(async (user: User | null) => {
    if (!user) {
      dispatch({ type: "entitlements/reset" });
      return;
    }

    dispatch({ type: "entitlements/fetchStart" });
    try {
      const entitlements = await EntitlementsService.deriveFromUser(user);
      startTransition(() => {
        dispatch({
          type: "entitlements/fetchSuccess",
          payload: entitlements,
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh entitlements";
      dispatch({
        type: "entitlements/fetchFailure",
        payload: { error: message },
      });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "entitlements/reset" });
  }, []);

  // Immutable context values
  const stateValue = useMemo<EntitlementsStateValue>(
    () => ({
      ...state,
      selectors,
      isPending,
    }),
    [state, selectors, isPending]
  );

  const actionsValue = useMemo<EntitlementsActionsValue>(
    () => ({
      refresh,
      reset,
    }),
    [refresh, reset]
  );

  return (
    <EntitlementsStateContext.Provider value={stateValue}>
      <EntitlementsActionsContext.Provider value={actionsValue}>
        {children}
      </EntitlementsActionsContext.Provider>
    </EntitlementsStateContext.Provider>
  );
}

// ================================================================================
// Public Hooks
// ================================================================================

export function useEntitlementsState(): EntitlementsStateValue {
  const context = useContext(EntitlementsStateContext);
  if (!context) {
    throw new Error("useEntitlementsState must be used within EntitlementsProvider");
  }
  return context;
}

export function useEntitlementsActions(): EntitlementsActionsValue {
  const context = useContext(EntitlementsActionsContext);
  if (!context) {
    throw new Error("useEntitlementsActions must be used within EntitlementsProvider");
  }
  return context;
}

export function useEntitlements() {
  return {
    ...useEntitlementsState(),
    ...useEntitlementsActions(),
  };
}
