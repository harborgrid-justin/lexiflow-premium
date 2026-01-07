/**
 * Example state slice - User preferences
 */

import { store } from "./index";

interface UserPreferencesState {
  theme: "light" | "dark";
  locale: string;
  sidebarOpen: boolean;
}

const PREFERENCES_KEY = "userPreferences";

export const userPreferencesSlice = {
  get: (): UserPreferencesState | undefined => {
    return store.getState<UserPreferencesState>(PREFERENCES_KEY);
  },

  set: (preferences: Partial<UserPreferencesState>): void => {
    const current = store.getState<UserPreferencesState>(PREFERENCES_KEY) || {
      theme: "light",
      locale: "en",
      sidebarOpen: true,
    };
    store.setState(PREFERENCES_KEY, { ...current, ...preferences });
  },

  setTheme: (theme: "light" | "dark"): void => {
    userPreferencesSlice.set({ theme });
  },

  setLocale: (locale: string): void => {
    userPreferencesSlice.set({ locale });
  },

  toggleSidebar: (): void => {
    const current = userPreferencesSlice.get();
    userPreferencesSlice.set({ sidebarOpen: !current?.sidebarOpen });
  },
};
