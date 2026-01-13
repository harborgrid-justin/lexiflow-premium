// src/contexts/entitlements/EntitlementsContext.tsx
import { apiClient } from "@/services/infrastructure/apiClient";
import type { Organization } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useAuth } from "../auth/AuthContext";
import { freezeInDev } from "../utils/immutability";

export type Plan = "free" | "pro" | "enterprise";

export type Entitlements = {
  plan: Plan;
  canUseAdminTools: boolean;
  maxCases: number;
  storageLimitGB: number;
};

interface EntitlementsStateValue {
  entitlements: Entitlements;
  isLoading: boolean;
  isPending: boolean; // GUIDELINE #33: Expose transitional state
}

interface EntitlementsActionsValue {
  // No actions needed for now - entitlements are computed from auth state
}

export type EntitlementsContextValue = EntitlementsStateValue & EntitlementsActionsValue;

const EntitlementsStateContext = createContext<EntitlementsStateValue | undefined>(undefined);
const EntitlementsActionsContext = createContext<EntitlementsActionsValue | undefined>(undefined);

const DEFAULT_ENTITLEMENTS: Entitlements = {
  plan: "free",
  canUseAdminTools: false,
  maxCases: 5,
  storageLimitGB: 1,
};

export const EntitlementsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { auth } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [isLoading, setIsLoading] = useState(false);
  
  // GUIDELINE #25-26: Use startTransition for non-urgent context updates
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchEntitlements = async () => {
      if (auth.status !== "authenticated" || !auth.user) {
        setEntitlements(DEFAULT_ENTITLEMENTS);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Derive basic entitlements from User Role
        let plan: Plan = "free";
        let canUseAdminTools = false;
        let maxCases = 10;
        let storageLimitGB = 5;

        // Map from UserRole type: 'Senior Partner' | 'Associate' | 'Paralegal' | 'Administrator' | 'Client User' | 'Guest'
        if (auth.user.role === "Administrator") {
          plan = "enterprise";
          canUseAdminTools = true;
        } else if (auth.user.role === "Senior Partner" || auth.user.role === "Associate") {
          if (auth.user.orgId) {
            try {
              const org = await apiClient.get<Organization>(`/organizations/${auth.user.orgId}`);
              // Logic to map org type/status to limits
              if (org.organizationType === 'corporation') { // Example mapping
                maxCases = 1000;
                storageLimitGB = 1000;
                plan = "enterprise"; // Override based on org
              }
            } catch (e) {
              console.warn("Could not fetch organization details", e);
            }
          }
        }

        // GUIDELINE #25: Wrap non-urgent state updates in startTransition
        // Entitlement changes are not urgent - UI can remain interactive during fetch
        startTransition(() => {
          setEntitlements({
            plan,
            canUseAdminTools,
            maxCases,
            storageLimitGB
          });
        });
      } catch (err) {
        console.error("Failed to calculate entitlements", err);
        // Fallback to defaults or derived from role only
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntitlements();
  }, [auth.status, auth.user]);

  // GUIDELINE #33: Expose isPending to consumers for transitional UI
  const stateValue = useMemo<EntitlementsStateValue>(
    () => freezeInDev({ entitlements, isLoading, isPending }),
    [entitlements, isLoading, isPending]
  );
  const actionsValue = useMemo<EntitlementsActionsValue>(() => freezeInDev({}), []);

  return (
    <EntitlementsStateContext.Provider value={stateValue}>
      <EntitlementsActionsContext.Provider value={actionsValue}>
        {children}
      </EntitlementsActionsContext.Provider>
    </EntitlementsStateContext.Provider>
  );
};

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

export function useEntitlements(): EntitlementsContextValue {
  return {
    ...useEntitlementsState(),
    ...useEntitlementsActions(),
  };
}
