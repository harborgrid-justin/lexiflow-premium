/**
 * ==============================================================================
 * ENTITLEMENTS PROVIDER - APPLICATION LAYER
 * ==============================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + RBAC + Transitions
 *
 * RESPONSIBILITIES:
 * • Role-based entitlements (plan, limits, admin access)
 * • Server-authoritative derivation from authenticated user
 * • Stable state/actions contexts
 *
 * DATA FLOW:
 * SERVER → AUTH → ENTITLEMENTS PROVIDER → CONSUMERS
 *
 * @module providers/application/entitlementsprovider
 */

import { EntitlementsActionsContext, EntitlementsStateContext } from '@/lib/entitlements/contexts';
import type {
  Entitlements,
  EntitlementsAction,
  EntitlementsActionsValue,
  EntitlementsState,
  EntitlementsStateValue,
} from '@/lib/entitlements/types';
import { useAuthState } from '@/providers/application/authprovider';
import { EntitlementsService } from '@/services/domain/entitlements.service';
import type { User } from '@/types';
import { ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useTransition } from 'react';

// ============================================================================
// STATE SHAPE (DEFAULTS)
// ============================================================================

const DEFAULT_ENTITLEMENTS: Entitlements = {
  plan: 'free',
  canUseAdminTools: false,
  maxCases: 5,
  storageLimitGB: 1,
};

const initialState: EntitlementsState = {
  entitlements: DEFAULT_ENTITLEMENTS,
  isLoading: false,
  error: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function entitlementsReducer(state: EntitlementsState, action: EntitlementsAction): EntitlementsState {
  switch (action.type) {
    case 'entitlements/fetchStart':
      return { ...state, isLoading: true, error: null };
    case 'entitlements/fetchSuccess':
      return { ...state, entitlements: action.payload, isLoading: false, error: null };
    case 'entitlements/fetchFailure':
      return { ...state, isLoading: false, error: action.payload.error };
    case 'entitlements/reset':
      return initialState;
    default:
      return state;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export interface EntitlementsProviderProps {
  children: ReactNode;
}

export function EntitlementsProvider({ children }: EntitlementsProviderProps) {
  const { user } = useAuthState();
  const [state, dispatch] = useReducer(entitlementsReducer, initialState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'entitlements/reset' });
      return;
    }

    const fetchEntitlements = async () => {
      dispatch({ type: 'entitlements/fetchStart' });
      try {
        const entitlements = await EntitlementsService.deriveFromUser(user as unknown as User);
        startTransition(() => {
          dispatch({ type: 'entitlements/fetchSuccess', payload: entitlements });
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch entitlements';
        dispatch({ type: 'entitlements/fetchFailure', payload: { error: message } });
      }
    };

    fetchEntitlements();
  }, [user, startTransition]);

  const refresh = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'entitlements/reset' });
      return;
    }

    dispatch({ type: 'entitlements/fetchStart' });
    try {
      const entitlements = await EntitlementsService.deriveFromUser(user as unknown as User);
      startTransition(() => {
        dispatch({ type: 'entitlements/fetchSuccess', payload: entitlements });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh entitlements';
      dispatch({ type: 'entitlements/fetchFailure', payload: { error: message } });
    }
  }, [user, startTransition]);

  const reset = useCallback(() => {
    dispatch({ type: 'entitlements/reset' });
  }, []);

  const stateValue = useMemo<EntitlementsStateValue>(
    () => ({
      entitlements: state.entitlements,
      isLoading: state.isLoading,
      error: state.error,
    }),
    [state.entitlements, state.isLoading, state.error]
  );

  const actionsValue = useMemo<EntitlementsActionsValue>(
    () => ({ refresh, reset }),
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

// ============================================================================
// HOOKS
// ============================================================================

export function useEntitlementsState(): EntitlementsStateValue {
  const context = useContext(EntitlementsStateContext);
  if (!context) {
    throw new Error('useEntitlementsState must be used within EntitlementsProvider');
  }
  return context;
}

export function useEntitlementsActions(): EntitlementsActionsValue {
  const context = useContext(EntitlementsActionsContext);
  if (!context) {
    throw new Error('useEntitlementsActions must be used within EntitlementsProvider');
  }
  return context;
}

export function useEntitlements() {
  return {
    ...useEntitlementsState(),
    ...useEntitlementsActions(),
  };
}
