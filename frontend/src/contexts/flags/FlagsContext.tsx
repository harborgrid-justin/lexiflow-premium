// src/contexts/flags/FlagsContext.tsx
import { apiClient } from "@/services/infrastructure/apiClient";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Flags = {
  enableNewDashboard: boolean;
  enableAdminTools: boolean;
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
};

const DEFAULT_FLAGS: Flags = {
  enableNewDashboard: true,
  enableAdminTools: false,
  ocr: false,
  aiAssistant: false,
  realTimeSync: true,
};

type FlagsContextValue = {
  flags: Flags;
  isLoading: boolean;
  error: string | null;
  refreshFlags: () => Promise<void>;
};

const FlagsContext = createContext<FlagsContextValue | null>(null);

export const FlagsProvider: React.FC<React.PropsWithChildren<{ initial?: Partial<Flags> }>> = ({
  initial,
  children
}) => {
  const [flags, setFlags] = useState<Flags>({ ...DEFAULT_FLAGS, ...initial });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to fetch from backend
      // If endpoint doesn't exist, this will throw, and we'll catch it
      const response = await apiClient.get<Flags>('/api/features');
      setFlags({ ...DEFAULT_FLAGS, ...response });
      setError(null);
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

  const value = useMemo(() => ({ flags, isLoading, error, refreshFlags }), [flags, isLoading, error, refreshFlags]);
  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
};

export const useFlags = (): FlagsContextValue => {
  const ctx = useContext(FlagsContext);
  if (!ctx) throw new Error("useFlags must be used within FlagsProvider");
  return ctx;
};
