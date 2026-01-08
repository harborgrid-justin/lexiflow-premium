/**
 * Entitlements Context for LexiFlow Enterprise Legal Platform
 *
 * Provides plan-based entitlements with:
 * - User role-based access control
 * - Organization-level feature limits
 * - Plan tier management (free, pro, enterprise)
 * - Storage and case limits
 *
 * @module contexts/EntitlementsContext
 */

'use client';

import { apiClient } from '@/services/infrastructure/apiClient';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

// ============================================================================
// Types
// ============================================================================

/**
 * Subscription plan tiers
 */
export type Plan = 'free' | 'pro' | 'enterprise';

/**
 * Feature limits and capabilities based on plan
 */
export interface Entitlements {
  /** Current subscription plan */
  plan: Plan;
  /** Whether user can access admin tools */
  canUseAdminTools: boolean;
  /** Maximum number of cases allowed */
  maxCases: number;
  /** Storage limit in gigabytes */
  storageLimitGB: number;
  /** Whether user can use AI features */
  canUseAI: boolean;
  /** Whether user can use advanced analytics */
  canUseAnalytics: boolean;
  /** Maximum number of team members */
  maxTeamMembers: number;
  /** Whether user can use custom integrations */
  canUseIntegrations: boolean;
  /** Whether user can access API */
  canUseAPI: boolean;
  /** Maximum document size in MB */
  maxDocumentSizeMB: number;
}

/**
 * Organization details for entitlements calculation
 */
interface OrganizationDetails {
  id: string;
  name: string;
  organizationType: string;
  subscriptionPlan?: Plan;
  customLimits?: Partial<Entitlements>;
}

/**
 * Entitlements context state
 */
export interface EntitlementsState {
  /** Current entitlements */
  entitlements: Entitlements;
  /** Loading state during entitlements calculation */
  isLoading: boolean;
}

/**
 * Entitlements context actions
 */
export interface EntitlementsActions {
  /** Refresh entitlements from backend */
  refreshEntitlements: () => Promise<void>;
  /** Check if user can perform an action */
  canPerform: (action: keyof Omit<Entitlements, 'plan' | 'maxCases' | 'storageLimitGB' | 'maxTeamMembers' | 'maxDocumentSizeMB'>) => boolean;
  /** Check if user has at least a certain plan */
  hasMinimumPlan: (minimumPlan: Plan) => boolean;
}

/**
 * Combined context value
 */
export type EntitlementsContextValue = EntitlementsState & EntitlementsActions;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_ENTITLEMENTS: Entitlements = {
  plan: 'free',
  canUseAdminTools: false,
  maxCases: 5,
  storageLimitGB: 1,
  canUseAI: false,
  canUseAnalytics: false,
  maxTeamMembers: 3,
  canUseIntegrations: false,
  canUseAPI: false,
  maxDocumentSizeMB: 10,
};

const PRO_ENTITLEMENTS: Entitlements = {
  plan: 'pro',
  canUseAdminTools: false,
  maxCases: 100,
  storageLimitGB: 50,
  canUseAI: true,
  canUseAnalytics: true,
  maxTeamMembers: 25,
  canUseIntegrations: true,
  canUseAPI: true,
  maxDocumentSizeMB: 100,
};

const ENTERPRISE_ENTITLEMENTS: Entitlements = {
  plan: 'enterprise',
  canUseAdminTools: true,
  maxCases: -1, // Unlimited
  storageLimitGB: -1, // Unlimited
  canUseAI: true,
  canUseAnalytics: true,
  maxTeamMembers: -1, // Unlimited
  canUseIntegrations: true,
  canUseAPI: true,
  maxDocumentSizeMB: 500,
};

const PLAN_ORDER: Plan[] = ['free', 'pro', 'enterprise'];

// ============================================================================
// Context
// ============================================================================

const EntitlementsStateContext = createContext<EntitlementsState | undefined>(undefined);
const EntitlementsActionsContext = createContext<EntitlementsActions | undefined>(undefined);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Access entitlements state
 * @throws Error if used outside EntitlementsProvider
 */
export function useEntitlementsState(): EntitlementsState {
  const context = useContext(EntitlementsStateContext);
  if (!context) {
    throw new Error('useEntitlementsState must be used within an EntitlementsProvider');
  }
  return context;
}

/**
 * Access entitlements actions
 * @throws Error if used outside EntitlementsProvider
 */
export function useEntitlementsActions(): EntitlementsActions {
  const context = useContext(EntitlementsActionsContext);
  if (!context) {
    throw new Error('useEntitlementsActions must be used within an EntitlementsProvider');
  }
  return context;
}

/**
 * Convenience hook for both state and actions
 * @throws Error if used outside EntitlementsProvider
 */
export function useEntitlements(): EntitlementsContextValue {
  return {
    ...useEntitlementsState(),
    ...useEntitlementsActions(),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get base entitlements for a plan
 */
function getEntitlementsForPlan(plan: Plan): Entitlements {
  switch (plan) {
    case 'enterprise':
      return { ...ENTERPRISE_ENTITLEMENTS };
    case 'pro':
      return { ...PRO_ENTITLEMENTS };
    default:
      return { ...DEFAULT_ENTITLEMENTS };
  }
}

// ============================================================================
// Provider Component
// ============================================================================

export interface EntitlementsProviderProps {
  children: ReactNode;
}

/**
 * Entitlements Provider
 *
 * Wraps the application to provide entitlements access.
 * Calculates entitlements based on user role and organization.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <EntitlementsProvider>
 *     <App />
 *   </EntitlementsProvider>
 * </AuthProvider>
 * ```
 */
export function EntitlementsProvider({ children }: EntitlementsProviderProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State
  const [entitlements, setEntitlements] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh entitlements based on user and organization
  const refreshEntitlements = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEntitlements(DEFAULT_ENTITLEMENTS);
      return;
    }

    setIsLoading(true);

    try {
      // Start with role-based entitlements
      let plan: Plan = 'free';
      let baseEntitlements = { ...DEFAULT_ENTITLEMENTS };

      // Map user role to base plan
      // Administrator gets enterprise, Senior roles get pro
      const role = user.role?.toLowerCase() || '';

      if (role === 'administrator' || role === 'admin') {
        plan = 'enterprise';
        baseEntitlements = { ...ENTERPRISE_ENTITLEMENTS };
      } else if (role === 'senior partner' || role === 'partner' || role === 'attorney') {
        plan = 'pro';
        baseEntitlements = { ...PRO_ENTITLEMENTS };
      }

      // If user has organization, fetch org-level entitlements
      if (user.organizationId) {
        try {
          const org = await apiClient.get<OrganizationDetails>(
            `/organizations/${user.organizationId}`
          );

          // Override with org subscription plan if available
          if (org.subscriptionPlan) {
            plan = org.subscriptionPlan;
            baseEntitlements = getEntitlementsForPlan(plan);
          }

          // Apply any custom limits from organization
          if (org.customLimits) {
            baseEntitlements = {
              ...baseEntitlements,
              ...org.customLimits,
              plan, // Ensure plan is preserved
            };
          }

          // Corporation type organizations get enterprise features
          if (org.organizationType === 'corporation' && plan !== 'enterprise') {
            baseEntitlements = {
              ...ENTERPRISE_ENTITLEMENTS,
              plan: 'enterprise',
            };
          }
        } catch (err) {
          console.warn('[EntitlementsContext] Could not fetch organization details:', err);
          // Continue with role-based entitlements
        }
      }

      setEntitlements(baseEntitlements);
      console.log('[EntitlementsContext] Entitlements calculated:', baseEntitlements.plan);
    } catch (err) {
      console.error('[EntitlementsContext] Failed to calculate entitlements:', err);
      // Fallback to defaults
      setEntitlements(DEFAULT_ENTITLEMENTS);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Check if user can perform an action (boolean entitlement)
  const canPerform = useCallback(
    (action: keyof Omit<Entitlements, 'plan' | 'maxCases' | 'storageLimitGB' | 'maxTeamMembers' | 'maxDocumentSizeMB'>): boolean => {
      return entitlements[action] === true;
    },
    [entitlements]
  );

  // Check if user has at least a certain plan level
  const hasMinimumPlan = useCallback(
    (minimumPlan: Plan): boolean => {
      const currentIndex = PLAN_ORDER.indexOf(entitlements.plan);
      const minimumIndex = PLAN_ORDER.indexOf(minimumPlan);
      return currentIndex >= minimumIndex;
    },
    [entitlements.plan]
  );

  // Recalculate entitlements when auth state changes
  useEffect(() => {
    if (!authLoading) {
      refreshEntitlements();
    }
  }, [authLoading, refreshEntitlements]);

  // Memoized context values
  const stateValue = useMemo<EntitlementsState>(
    () => ({
      entitlements,
      isLoading,
    }),
    [entitlements, isLoading]
  );

  const actionsValue = useMemo<EntitlementsActions>(
    () => ({
      refreshEntitlements,
      canPerform,
      hasMinimumPlan,
    }),
    [refreshEntitlements, canPerform, hasMinimumPlan]
  );

  return (
    <EntitlementsStateContext.Provider value={stateValue}>
      <EntitlementsActionsContext.Provider value={actionsValue}>
        {children}
      </EntitlementsActionsContext.Provider>
    </EntitlementsStateContext.Provider>
  );
}

export default EntitlementsProvider;
