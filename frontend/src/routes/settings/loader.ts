/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Settings Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  category: "general" | "security" | "notifications" | "integrations";
  description: string;
};

export interface SettingsLoaderData {
  settings: SystemSetting[];
}

export async function settingsLoader() {
  const settings = await DataService.settings.getAll().catch(() => []);

  return {
    settings: settings || [],
  };
}
