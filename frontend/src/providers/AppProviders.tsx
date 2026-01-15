/**
 * ================================================================================
 * APP PROVIDERS - ROOT COMPOSITION ROOT
 * ================================================================================
 *
 * This component composes the provider layers in the correct order.
 *
 * LAYERING:
 * 1. InfrastructureLayer (Env, Theme, Toast)
 * 2. ApplicationLayer    (Auth, Flags, Entitlements)
 *
 * USAGE:
 * Use <AppProviders> in the root App component.
 */

import { FlagsProviderProps } from "@/unknown_fix_me/FlagsProviderProps";
import { ReactNode } from "react";
import { ApplicationLayer } from "./application/ApplicationLayer";
import { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";

export interface AppProvidersProps {
  children: ReactNode;
  initialFlags?: FlagsProviderProps["initial"];
}

export function AppProviders({ children, initialFlags }: AppProvidersProps) {
  return (
    <InfrastructureLayer>
      <ApplicationLayer initialFlags={initialFlags}>
        {children}
      </ApplicationLayer>
    </InfrastructureLayer>
  );
}

export default AppProviders;
