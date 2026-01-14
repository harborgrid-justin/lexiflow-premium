/**
 * Settings Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

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

  return defer({
    settings: settings || [],
  });
}
