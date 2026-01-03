// src/contexts/entitlements/EntitlementsContext.tsx
import { apiClient } from "@/services/infrastructure/apiClient";
import type { Organization } from "@/types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export type Plan = "free" | "pro" | "enterprise";

export type Entitlements = {
  plan: Plan;
  canUseAdminTools: boolean;
  maxCases: number;
  storageLimitGB: number;
};

type EntitlementsContextValue = {
  entitlements: Entitlements;
  isLoading: boolean;
};

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

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

        setEntitlements({
          plan,
          canUseAdminTools,
          maxCases,
          storageLimitGB
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

  const value = useMemo(() => ({ entitlements, isLoading }), [entitlements, isLoading]);
};

export const useEntitlements = (): EntitlementsContextValue => {
  const ctx = useContext(EntitlementsContext);
  if (!ctx) throw new Error("useEntitlements must be used within EntitlementsProvider");
  return ctx;
};
