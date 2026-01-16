import { useTheme } from "@/hooks/useTheme";
import { authApi } from "@/lib/frontend-api";
import { ExtendedUserProfile } from "@/types";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type PreferencesStatus = "idle" | "saving" | "success" | "error";

export interface PreferencesState {
  locale: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  status: PreferencesStatus;
}

export interface PreferencesActions {
  updateLocale: (locale: string) => void;
  updateTimezone: (timezone: string) => void;
  toggleEmailNotifications: (enabled: boolean) => void;
  togglePushNotifications: (enabled: boolean) => void;
  setThemeMode: (mode: "light" | "dark") => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useProfilePreferences = (profile: ExtendedUserProfile) => {
  const { setTheme, mode } = useTheme();
  const [status, setStatus] = useState<PreferencesStatus>("idle");

  // Local state initialized from profile
  // In a real app we might sync this or use a form library
  const [preferences, setPreferences] = useState({
    locale: profile.preferences.locale,
    timezone: profile.preferences.timezone,
    emailNotifications: profile.preferences.notifications.email,
    pushNotifications: profile.preferences.notifications.push,
  });

  const savePreference = useCallback(
    async (key: string, value: unknown) => {
      setStatus("saving");
      try {
        await authApi.users.updatePreferences(profile.id, {
          [key]: value,
        });
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    },
    [profile.id]
  );

  const updateLocale = useCallback(
    (locale: string) => {
      setPreferences((prev) => ({ ...prev, locale }));
      savePreference("locale", locale);
    },
    [savePreference]
  );

  const updateTimezone = useCallback(
    (timezone: string) => {
      setPreferences((prev) => ({ ...prev, timezone }));
      savePreference("timezone", timezone);
    },
    [savePreference]
  );

  const toggleEmailNotifications = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => ({ ...prev, emailNotifications: enabled }));
      savePreference("notifications.email", enabled);
    },
    [savePreference]
  );

  const togglePushNotifications = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => ({ ...prev, pushNotifications: enabled }));
      savePreference("notifications.push", enabled);
    },
    [savePreference]
  );

  return [
    {
      ...preferences,
      status,
      mode, // Exporting mode from theme here for convenience/completeness of "Preferences" state
    },
    {
      updateLocale,
      updateTimezone,
      toggleEmailNotifications,
      togglePushNotifications,
      setThemeMode: setTheme,
    },
  ] as const;
};
