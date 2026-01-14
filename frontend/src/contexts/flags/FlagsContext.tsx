// src/contexts/flags/FlagsContext.tsx
import { FEATURES_CONFIG } from "@/config/features/features.config";
import { apiClient } from "@/services/infrastructure/apiClient";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { freezeInDev } from "../utils/immutability";

export type Flags = {
  enableNewDashboard: boolean;
  enableAdminTools: boolean;
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
};

const DEFAULT_FLAGS: Flags = {
  enableNewDashboard: true,
  enableAdminTools: false, // controlled by RBAC usually
  ocr: FEATURES_CONFIG.documentComparison, // using document comparison as proxy for OCR features
  aiAssistant: FEATURES_CONFIG.aiAssistance,
  realTimeSync: FEATURES_CONFIG.realtimeCollaboration,
};

interface FlagsStateValue {
  flags: Flags;
  isLoading: boolean;
  isPending: boolean; // GUIDELINE #33: Expose transitional state
  error: string | null;
}

interface FlagsActionsValue {
  refreshFlags: () => Promise<void>;
}

export type FlagsContextValue = FlagsStateValue & FlagsActionsValue;

const FlagsStateContext = createContext<FlagsStateValue | undefined>(undefined);
const FlagsActionsContext = createContext<FlagsActionsValue | undefined>(undefined);

export function FlagsProvider({
  initial,
  children
}: React.PropsWithChildren<{ initial?: Partial<Flags> }>) {
  const [flags, setFlags] = useState<Flags>({ ...DEFAULT_FLAGS, ...initial });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GUIDELINE #25-26: Use startTransition for non-urgent context updates
  const [isPending, startTransition] = useTransition();

  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to fetch from backend
      // If endpoint doesn't exist, this will throw, and we'll catch it
      const response = await apiClient.get<Flags>('/api/features');

      // GUIDELINE #25: Wrap non-urgent state updates in startTransition
      // Feature flag changes are not urgent - UI can remain interactive during fetch
      startTransition(() => {
        setFlags({ ...DEFAULT_FLAGS, ...response });
        setError(null);
      });
    } catch (err) {
      console.warn("Failed to fetch feature flags, using defaults/initial", err);
      // In production, we might want to log this to a monitoring service
      // For now, we keep the current flags (defaults + initial)
      // We don't set error to block the UI, just warn
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // GUIDELINE #33: Expose isPending to consumers for transitional UI
  const stateValue = useMemo<FlagsStateValue>(
    () => freezeInDev({ flags, isLoading, isPending, error }),
    [flags, isLoading, isPending, error]
  );
  const actionsValue = useMemo<FlagsActionsValue>(() => freezeInDev({ refreshFlags }), [refreshFlags]);

  return (
    <FlagsStateContext.Provider value={stateValue}>
      <FlagsActionsContext.Provider value={actionsValue}>
        {children}
      </FlagsActionsContext.Provider>
    </FlagsStateContext.Provider>
  );
};

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

export function useFlags(): FlagsContextValue {
  return {
    ...useFlagsState(),
    ...useFlagsActions(),
  };
}
