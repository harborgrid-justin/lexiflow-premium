/**
 * ================================================================================
 * APPLICATION LAYER - GLOBAL APP CONTEXTS
 * ================================================================================
 *
 * ENTERPRISE LAYERING: MID LAYER
 *
 * RESPONSIBILITIES:
 * - Authentication State (AuthProvider)
 * - Permission/RBAC System (EntitlementsProvider)
 * - Feature Flags (FlagsProvider)
 *
 * RULES:
 * - Depends ONLY on Infrastructure Layer
 * - Must NOT depend on Domain Layer (Routes)
 * - Provides security and configuration context for the whole app
 *
 * @module providers/application
 */

import { AuthProvider } from "@/contexts/auth/AuthContext";
import { EntitlementsProvider } from "@/contexts/entitlements/EntitlementsContext";
import { FlagsProvider, FlagsProviderProps } from "@/contexts/flags/FlagsContext";
import { ReactNode } from "react";

export interface ApplicationLayerProps {
  children: ReactNode;
  initialFlags?: FlagsProviderProps["initial"];
}

export function ApplicationLayer({ children, initialFlags }: ApplicationLayerProps) {
  return (
    <AuthProvider>
      <FlagsProvider initial={initialFlags}>
        <EntitlementsProvider>
          {children}
        </EntitlementsProvider>
      </FlagsProvider>
    </AuthProvider>
  );
}
