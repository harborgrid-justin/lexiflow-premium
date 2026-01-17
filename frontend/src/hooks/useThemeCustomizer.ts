import { useCallback, useEffect, useState } from "react";

import { useTheme } from "@/hooks/useTheme";
import { type DesignTokens, type ThemeDensity } from "@/lib/theme/tokens";
import { DataService } from "@/services/data/data-service.service";

// ============================================================================
// Types
// ============================================================================

export type ThemeCustomizerStatus = "idle" | "saving" | "success" | "error";

export interface ThemeCustomizerState {
  status: ThemeCustomizerStatus;
  message: string | null;
  customTokens: DesignTokens;
  mode: "light" | "dark";
  density: ThemeDensity;
}

export interface ThemeCustomizerActions {
  setTheme: (mode: "light" | "dark") => void;
  setDensity: (density: ThemeDensity) => void;
  updateColor: (path: string[], color: string) => void;
  saveChanges: () => Promise<void>;
  resetChanges: () => void;
}

// ============================================================================
// Logic
// ============================================================================

// Pure update helper (Rule 42)
export const updateNested = <T extends Record<string, unknown>>(
  obj: T,
  path: string[],
  value: string
): T => {
  const newObj = { ...obj };
  let current: Record<string, unknown> = newObj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (key) {
      current[key] = { ...((current[key] as Record<string, unknown>) || {}) };
      current = current[key] as Record<string, unknown>;
    }
  }
  const lastKey = path[path.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
  return newObj;
};

/**
 * Hook for Theme Customizer Logic
 *
 * Implements Advanced React Guidelines:
 * - Rule 42: Separate pure computation (updateNested) from effects
 * - Rule 43: Stable return shape (state vs actions)
 * - Rule 51: Explicit status enum instead of booleans
 */
export const useThemeCustomizer = (): [
  ThemeCustomizerState,
  ThemeCustomizerActions,
] => {
  // Rule 54: Fail fast is handled by useTheme throwing if context missing
  const { tokens, density, mode, setTheme, setDensity, updateToken } =
    useTheme();

  // Local state
  const [customTokens, setCustomTokens] = useState<DesignTokens>(tokens);

  // Rule 51: Explicit status machine
  const [status, setStatus] = useState<ThemeCustomizerStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Rule 58: Lifecycle - Sync with external context ONLY when context tokens change
  // This allows the local state to diverge temporarily while editing
  useEffect(() => {
    setCustomTokens(tokens);
  }, [tokens]);

  // Rule 53: Stable callbacks
  const updateColor = useCallback(
    (path: string[], value: string) => {
      // 1. Update local state for immediate UI feedback in inputs
      setCustomTokens(
        (prev) =>
          updateNested(
            prev as unknown as Record<string, unknown>,
            path,
            value
          ) as unknown as DesignTokens
      );

      // 2. Update global theme context for real-time preview
      // Map path to updateToken arguments: (category, key, value, subKey)
      // path[0] is category (e.g. 'colors')
      // path[1] is key (e.g. 'primary' or 'charts')
      // path[2] is subKey (e.g. 'blue')
      if (path.length >= 2) {
        const category = path[0] as keyof DesignTokens;
        const key = path[1];
        const subKey = path[2]; // Optional
        updateToken(category, key, value, subKey);
      }

      // Reset status on edit
      if (status !== "idle") {
        setStatus("idle");
        setMessage(null);
      }
    },
    [status, updateToken]
  );

  const saveChanges = useCallback(async () => {
    setStatus("saving");
    setMessage(null);

    try {
      // Update preferences using the Profile service
      await DataService.profile.updatePreferences({
        theme: mode,
        customTheme: customTokens as unknown as Record<string, unknown>,
      });

      setStatus("success");
      setMessage("Theme saved successfully!");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Failed to save theme (Backend API error). Check console.");
    }
  }, [mode, customTokens]);

  const resetChanges = useCallback(() => {
    setCustomTokens(tokens);
    setStatus("idle");
    setMessage(null);
  }, [tokens]);

  return [
    // Data-Oriented Return (Rule 44)
    {
      status,
      message,
      customTokens,
      mode,
      density,
    },
    // Stable Actions Object
    {
      setTheme,
      setDensity,
      updateColor,
      saveChanges,
      resetChanges,
    },
  ];
};
