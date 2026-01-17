/**
 * ==============================================================================
 * FLAGS PROVIDER - APPLICATION LAYER
 * ==============================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Loader Integration + Transitions
 *
 * RESPONSIBILITIES:
 * • Feature flag state management
 * • Server-authoritative flag resolution
 * • Loader-based initialization
 * • Stable state/actions contexts
 *
 * DATA FLOW:
 * SERVER → LOADER → FLAGS PROVIDER → CONSUMERS
 *
 * @module providers/application/flagsprovider
 */

import { type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useTransition } from 'react';

import { FEATURES_CONFIG } from '@/config/features/features.config';
import { FlagsActionsContext, FlagsStateContext } from '@/lib/flags/contexts';
import { FeatureFlagsService } from '@/services/domain/feature-flags.service';

import type {
  Flags,
  FlagsAction,
  FlagsActionsValue,
  FlagsState,
  FlagsStateValue,
} from '@/lib/flags/types';

// ============================================================================
// STATE SHAPE (DEFAULTS)
// ============================================================================

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

// ============================================================================
// REDUCER
// ============================================================================

function flagsReducer(state: FlagsState, action: FlagsAction): FlagsState {
  switch (action.type) {
    case 'flags/fetchStart':
      return { ...state, isLoading: true, error: null };
    case 'flags/fetchSuccess':
      return { ...state, flags: action.payload, isLoading: false, error: null };
    case 'flags/fetchFailure':
      return { ...state, isLoading: false, error: action.payload.error };
    case 'flags/initialize':
      return { ...state, flags: { ...DEFAULT_FLAGS, ...action.payload }, isLoading: false };
    case 'flags/reset':
      return initialState;
    default:
      return state;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export interface FlagsProviderProps {
  children: ReactNode;
  initial?: Partial<Flags>;
}

export function FlagsProvider({ children, initial }: FlagsProviderProps) {
  const [state, dispatch] = useReducer(flagsReducer, initialState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (initial) {
      startTransition(() => {
        dispatch({ type: 'flags/initialize', payload: initial });
      });
      return;
    }

    const fetchFlags = async () => {
      dispatch({ type: 'flags/fetchStart' });
      try {
        const flags = await FeatureFlagsService.fetchFlags();
        startTransition(() => {
          dispatch({ type: 'flags/fetchSuccess', payload: flags });
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch flags';
        dispatch({ type: 'flags/fetchFailure', payload: { error: message } });
      }
    };

    fetchFlags();
  }, [initial, startTransition]);

  const refresh = useCallback(async () => {
    dispatch({ type: 'flags/fetchStart' });
    try {
      const flags = await FeatureFlagsService.fetchFlags();
      startTransition(() => {
        dispatch({ type: 'flags/fetchSuccess', payload: flags });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh flags';
      dispatch({ type: 'flags/fetchFailure', payload: { error: message } });
    }
  }, [startTransition]);

  const reset = useCallback(() => {
    dispatch({ type: 'flags/reset' });
  }, []);

  const initialize = useCallback((flags: Partial<Flags>) => {
    startTransition(() => {
      dispatch({ type: 'flags/initialize', payload: flags });
    });
  }, [startTransition]);

  const stateValue = useMemo<FlagsStateValue>(
    () => ({
      flags: state.flags,
      isLoading: state.isLoading,
      error: state.error,
    }),
    [state.flags, state.isLoading, state.error]
  );

  const actionsValue = useMemo<FlagsActionsValue>(
    () => ({ refresh, reset, initialize }),
    [refresh, reset, initialize]
  );

  return (
    <FlagsStateContext.Provider value={stateValue}>
      <FlagsActionsContext.Provider value={actionsValue}>
        {children}
      </FlagsActionsContext.Provider>
    </FlagsStateContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useFlagsState(): FlagsStateValue {
  const context = useContext(FlagsStateContext);
  if (!context) {
    throw new Error('useFlagsState must be used within FlagsProvider');
  }
  return context;
}

export function useFlagsActions(): FlagsActionsValue {
  const context = useContext(FlagsActionsContext);
  if (!context) {
    throw new Error('useFlagsActions must be used within FlagsProvider');
  }
  return context;
}

export function useFlags() {
  return {
    ...useFlagsState(),
    ...useFlagsActions(),
  };
}
