// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - FEATURE FLAGS DOMAIN
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
//   ✓ Domain-scoped state only (feature flags)
//   ✓ No direct HTTP calls (uses FeatureFlagsService)
//   ✓ No router navigation
//   ✓ No JSX layout (only provider wrapper)
//   ✓ Loader-based initialization
//   ✓ Memoized selectors
//   ✓ Immutable context values
//   ✓ Concurrent-safe with useTransition
//
// ================================================================================

import { FEATURES_CONFIG } from "@/config/features/features.config";
import { FeatureFlagsService } from "@/services/domain/feature-flags.service";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useTransition } from "react";

// ================================================================================
// Types
// ================================================================================

export interface Flags {
  enableNewDashboard: boolean;
  enableAdminTools: boolean;
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
}

interface FlagsState {
  flags: Flags;
  isLoading: boolean;
  error: string | null;
}

type FlagsAction =
  | { type: "flags/fetchStart" }
  | { type: "flags/fetchSuccess"; payload: Flags }
  | { type: "flags/fetchFailure"; payload: { error: string } }
  | { type: "flags/initialize"; payload: Partial<Flags> }
  | { type: "flags/reset" };

// ================================================================================
// State Shape
// ================================================================================

const DEFAULT_FLAGS: Flags = {
  enableNewDashboard: true,
  enableAdminTools: false,
  ocr: FEATURES_CONFIG.documentComparison,
  aiAssistant: FEATURES_CONFIG.aiAssistance,
  realTimeSync: FEATURES_CONFIG.realtimeCollaboration,
};

const initialState: FlagsState = {
  flags: DEFAULT_FLAGS,
  isLoading: false,
  error: null,
};

// ================================================================================
// Reducer
// ================================================================================

function flagsReducer(state: FlagsState, action: FlagsAction): FlagsState {
  switch (action.type) {
    case "flags/fetchStart":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "flags/fetchSuccess":
      return {
        ...state,
        flags: action.payload,
        isLoading: false,
        error: null,
      };

    case "flags/fetchFailure":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case "flags/initialize":
      return {
        ...state,
        flags: { ...DEFAULT_FLAGS, ...action.payload },
        isLoading: false,
      };

    case "flags/reset":
      return initialState;

    default:
      return state;
  }
}

// ================================================================================
// Selectors (Memoized derivations)
// ================================================================================

interface FlagsSelectors {
  isFeatureEnabled: (featureName: keyof Flags) => boolean;
  enabledFeatures: string[];
  hasAnyAIFeatures: boolean;
}

function createSelectors(state: FlagsState): FlagsSelectors {
  const { flags } = state;

  return {
    isFeatureEnabled: (featureName: keyof Flags) => flags[featureName] === true,
    enabledFeatures: (Object.keys(flags) as Array<keyof Flags>).filter(
      (key) => flags[key] === true
    ),
    hasAnyAIFeatures: flags.aiAssistant || flags.ocr,
  };
}

// ================================================================================
// Context
// ================================================================================

interface FlagsStateValue extends FlagsState {
  selectors: FlagsSelectors;
  isPending: boolean; // React 18 transition state
}

interface FlagsActionsValue {
  refresh: () => Promise<void>;
  reset: () => void;
}

const FlagsStateContext = createContext<FlagsStateValue | null>(null);
const FlagsActionsContext = createContext<FlagsActionsValue | null>(null);

// ================================================================================
// Provider
// ================================================================================

export interface FlagsProviderProps {
  children: React.ReactNode;
  initial?: Partial<Flags>; // Loader-based initialization
}

export function FlagsProvider({ children, initial }: FlagsProviderProps) {
  const [state, dispatch] = useReducer(flagsReducer, initialState);
  const [isPending, startTransition] = useTransition();

  // Initialize flags on mount
  useEffect(() => {
    if (initial) {
      dispatch({ type: "flags/initialize", payload: initial });
    } else {
      // Fetch from service
      const fetchFlags = async () => {
        dispatch({ type: "flags/fetchStart" });
        try {
          const flags = await FeatureFlagsService.fetchFlags();
          startTransition(() => {
            dispatch({ type: "flags/fetchSuccess", payload: flags });
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch flags";
          dispatch({ type: "flags/fetchFailure", payload: { error: message } });
        }
      };

      fetchFlags();
    }
  }, [initial]);

  // Memoized selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Domain actions
  const refresh = useCallback(async () => {
    dispatch({ type: "flags/fetchStart" });
    try {
      const flags = await FeatureFlagsService.fetchFlags();
      startTransition(() => {
        dispatch({ type: "flags/fetchSuccess", payload: flags });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh flags";
      dispatch({ type: "flags/fetchFailure", payload: { error: message } });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "flags/reset" });
  }, []);

  // Immutable context values
  const stateValue = useMemo<FlagsStateValue>(
    () => ({
      ...state,
      selectors,
      isPending,
    }),
    [state, selectors, isPending]
  );

  const actionsValue = useMemo<FlagsActionsValue>(
    () => ({
      refresh,
      reset,
    }),
    [refresh, reset]
  );

  return (
    <FlagsStateContext.Provider value={stateValue}>
      <FlagsActionsContext.Provider value={actionsValue}>
        {children}
      </FlagsActionsContext.Provider>
    </FlagsStateContext.Provider>
  );
}

// ================================================================================
// Public Hooks
// ================================================================================

export function useFlagsState(): FlagsStateValue {
  const context = useContext(FlagsStateContext);
  if (!context) {
    throw new Error("useFlagsState must be used within FlagsProvider");
  }
  return context;
}

export function useFlagsActions(): FlagsActionsValue {
  const context = useContext(FlagsActionsContext);
  if (!context) {
    throw new Error("useFlagsActions must be used within FlagsProvider");
  }
  return context;
}

export function useFlags() {
  return {
    ...useFlagsState(),
    ...useFlagsActions(),
  };
}
